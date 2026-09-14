import {spawn} from 'node:child_process';
import {RenderInternals} from '@remotion/renderer';
import type {
	GetRemotionSkillsInfoResponse,
	InstallRemotionSkillRequest,
	RemoveRemotionSkillRequest,
} from '@remotion/studio-shared';
import {getPackageManagerSpawnOptions} from '../../helpers/package-manager-spawn-options';
import {remotionSkillNames} from '../../remotion-skill-names';
import type {ApiHandler} from '../api-types';
import {getPackageManager} from '../get-package-manager';
import {getRemotionSkillsInfo} from './remotion-skills-info';

const changingSkillsInProjects = new Set<string>();

const changeRemotionSkill = async ({
	action,
	remotionRoot,
	input: {skill},
	logLevel,
}: Parameters<
	ApiHandler<InstallRemotionSkillRequest, GetRemotionSkillsInfoResponse>
>[0] & {
	readonly action: 'install' | 'remove';
}): Promise<GetRemotionSkillsInfoResponse> => {
	if (!remotionSkillNames.some((name) => name === skill)) {
		throw new Error(`Unknown Remotion skill: ${JSON.stringify(skill)}`);
	}

	if (changingSkillsInProjects.has(remotionRoot)) {
		throw new Error(
			'A skill is already being installed or removed. Please try again once it finishes.',
		);
	}

	changingSkillsInProjects.add(remotionRoot);
	try {
		const installedSkill = getRemotionSkillsInfo({remotionRoot}).skills.find(
			({name}) => name === skill,
		);
		const removingGlobally =
			action === 'remove' &&
			installedSkill?.installedInProject === false &&
			installedSkill.installedGlobally;
		if (
			action === 'remove' &&
			!removingGlobally &&
			!installedSkill?.installedInProject
		) {
			throw new Error(`${skill} is not installed.`);
		}

		const packageManager = getPackageManager({
			remotionRoot,
			packageManager: undefined,
			dirUp: 0,
			logLevel,
		});
		const useBunx =
			packageManager !== 'unknown' && packageManager.manager === 'bun';
		const executable = useBunx
			? 'bunx'
			: process.platform === 'win32'
				? 'npx.cmd'
				: 'npx';
		const commandArgs =
			action === 'install'
				? ['add', `remotion-dev/skills@${skill}`, '--yes']
				: ['remove', ...(removingGlobally ? ['--global'] : []), skill, '--yes'];
		const args = useBunx
			? ['--silent', 'skills@1.5.26', ...commandArgs]
			: ['--yes', '--loglevel=error', 'skills@1.5.26', ...commandArgs];
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray(`╭─  ${executable} ${args.join(' ')}`),
		);
		const time = Date.now();
		try {
			await new Promise<void>((resolve, reject) => {
				const child = spawn(executable, args, {
					cwd: remotionRoot,
					env: {...process.env, DISABLE_TELEMETRY: '1'},
					stdio: ['ignore', 'pipe', 'pipe'],
					...getPackageManagerSpawnOptions(),
				});
				let output = '';
				const onData = (data: Buffer) => {
					output = (output + data.toString()).slice(-8000);
					data
						.toString()
						.trim()
						.split('\n')
						.forEach((line) =>
							RenderInternals.Log.info({indent: true, logLevel}, line),
						);
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
								`Could not ${action} ${skill} (exit code ${code}, signal ${signal}). ${output.trim()}`,
							),
						);
					}
				});
			});

			const info = getRemotionSkillsInfo({remotionRoot});
			const updatedSkill = info.skills.find(({name}) => name === skill);
			if (action === 'install' && !updatedSkill?.installedInProject) {
				throw new Error(
					`The installer finished, but ${skill} was not found in the project. Please try again.`,
				);
			}

			if (
				action === 'remove' &&
				(removingGlobally
					? updatedSkill?.installedGlobally
					: updatedSkill?.installedInProject)
			) {
				throw new Error(
					`The remover finished, but ${skill} is still installed ${removingGlobally ? 'globally' : 'in the project'}. Please try again.`,
				);
			}

			RenderInternals.Log.info(
				{indent: false, logLevel},
				RenderInternals.chalk.gray('╰─ '),
				`Done in ${Date.now() - time}ms`,
			);
			return info;
		} catch (error) {
			RenderInternals.Log.info(
				{indent: false, logLevel},
				RenderInternals.chalk.gray('╰─ '),
				RenderInternals.chalk.red(`Errored in ${Date.now() - time}ms`),
			);
			throw error;
		}
	} finally {
		changingSkillsInProjects.delete(remotionRoot);
	}
};

export const installRemotionSkillHandler: ApiHandler<
	InstallRemotionSkillRequest,
	GetRemotionSkillsInfoResponse
> = (input) => {
	return changeRemotionSkill({...input, action: 'install'});
};

export const removeRemotionSkillHandler: ApiHandler<
	RemoveRemotionSkillRequest,
	GetRemotionSkillsInfoResponse
> = (input) => {
	return changeRemotionSkill({...input, action: 'remove'});
};
