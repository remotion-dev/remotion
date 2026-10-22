import {spawn} from 'node:child_process';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

let upgrading = false;

export const handleUpgradeRemotion: ApiHandler<
	ApiRoutes['/api/upgrade-remotion']['Request'],
	ApiRoutes['/api/upgrade-remotion']['Response']
> = async ({remotionRoot, logLevel, input: {version}}) => {
	if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
		throw new Error('Invalid Remotion version.');
	}

	if (upgrading) {
		throw new Error('A Remotion upgrade is already in progress.');
	}

	upgrading = true;
	try {
		const cliPackage = require.resolve('@remotion/cli/package.json', {
			paths: [remotionRoot],
		});
		const cli = path.join(path.dirname(cliPackage), 'remotion-cli.js');
		await new Promise<void>((resolve, reject) => {
			const child = spawn(
				process.execPath,
				[cli, 'upgrade', `--version=${version}`],
				{
					cwd: remotionRoot,
					stdio: ['ignore', 'pipe', 'pipe'],
					env: {...process.env, CI: '1'},
				},
			);
			let output = '';
			const onOutput = (chunk: Buffer) => {
				const message = chunk.toString();
				output = (output + message).slice(-8000);
				RenderInternals.Log.info({indent: false, logLevel}, message.trimEnd());
			};

			child.stdout.on('data', onOutput);
			child.stderr.on('data', onOutput);
			child.on('error', reject);
			child.on('close', (code, signal) => {
				if (code === 0) {
					resolve();
				} else {
					reject(
						new Error(
							`Remotion upgrade failed (exit code ${code}, signal ${signal}).\n${output}`,
						),
					);
				}
			});
		});
		return {};
	} finally {
		upgrading = false;
	}
};
