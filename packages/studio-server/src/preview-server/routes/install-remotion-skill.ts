import {spawn} from 'node:child_process';
import type {
	GetRemotionSkillsInfoResponse,
	InstallRemotionSkillRequest,
} from '@remotion/studio-shared';
import {getPackageManagerSpawnOptions} from '../../helpers/package-manager-spawn-options';
import {remotionSkillNames} from '../../remotion-skill-names';
import type {ApiHandler} from '../api-types';
import {getRemotionSkillsInfo} from './remotion-skills-info';

const installingInProjects = new Set<string>();

export const installRemotionSkillHandler: ApiHandler<
	InstallRemotionSkillRequest,
	GetRemotionSkillsInfoResponse
> = async ({remotionRoot, input: {skill}}) => {
	if (!remotionSkillNames.some((name) => name === skill)) {
		throw new Error(`Unknown Remotion skill: ${JSON.stringify(skill)}`);
	}

	if (installingInProjects.has(remotionRoot)) {
		throw new Error(
			'A skill is already being installed. Please try again once it finishes.',
		);
	}

	installingInProjects.add(remotionRoot);
	try {
		await new Promise<void>((resolve, reject) => {
			const child = spawn(
				process.platform === 'win32' ? 'npx.cmd' : 'npx',
				[
					'--yes',
					'--loglevel=error',
					'skills@1.5.20',
					'add',
					'remotion-dev/skills',
					'--skill',
					skill,
					'--yes',
				],
				{
					cwd: remotionRoot,
					stdio: ['ignore', 'pipe', 'pipe'],
					...getPackageManagerSpawnOptions(),
				},
			);
			let output = '';
			const onData = (data: Buffer) => {
				output = (output + data.toString()).slice(-8000);
			};

			child.stdout.on('data', onData);
			child.stderr.on('data', onData);
			child.on('error', reject);
			child.on('close', (code, signal) => {
				if (code === 0) {
					resolve();
				} else {
					reject(
						new Error(
							`Could not install ${skill} (exit code ${code}, signal ${signal}). ${output.trim()}`,
						),
					);
				}
			});
		});

		const info = getRemotionSkillsInfo({remotionRoot});
		if (!info.skills.find(({name}) => name === skill)?.installedInProject) {
			throw new Error(
				`The installer finished, but ${skill} was not found in the project. Please try again.`,
			);
		}

		return info;
	} finally {
		installingInProjects.delete(remotionRoot);
	}
};
