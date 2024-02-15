import {exec, spawn} from 'node:child_process';
import {platform} from 'node:os';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';

export const openDirectoryInFinder = (
	dirToOpen: string,
	allowedDirectory: string,
) => {
	const resolved = path.resolve(allowedDirectory, dirToOpen);

	const relativeToProcessCwd = path.relative(allowedDirectory, resolved);
	if (relativeToProcessCwd.startsWith('..')) {
		throw new Error(`Not allowed to open ${relativeToProcessCwd}`);
	}

	if (platform() === 'win32') {
		return new Promise<void>((resolve, reject) => {
			exec(`explorer.exe /select,${resolved}`, (error) => {
				if (error?.code === 1) {
					resolve();
					return;
				}

				if (error) {
					reject(error);
				}

				resolve();
			});
		});
	}

	const command = platform() === 'darwin' ? 'open' : 'xdg-open';

	const p = spawn(
		command,
		[platform() === 'darwin' ? '-R' : null, dirToOpen].filter(
			NoReactInternals.truthy,
		),
	);

	const stderrChunks: Buffer[] = [];
	p.stderr.on('data', (d) => stderrChunks.push(d));

	return new Promise<void>((resolve, reject) => {
		p.on('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				const message = Buffer.concat(stderrChunks).toString('utf-8');
				reject(new Error(message));
			}
		});
		p.on('error', (err) => {
			p.kill();
			if (err) {
				reject(err);
			}
		});
	});
};
