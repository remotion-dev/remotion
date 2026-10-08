import {lstatSync, mkdirSync, realpathSync, symlinkSync} from 'node:fs';
import path from 'node:path';
import execa from 'execa';
import type {SkillsInstallation} from './ask-skills';
import {Log} from './log';

export const installSkills = async (
	projectRoot: string,
	selection: SkillsInstallation,
) => {
	const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
	const args = [
		'-y',
		'--loglevel=error',
		'skills@1.7.0',
		'add',
		'remotion-dev/skills',
		'--agent',
		'universal',
		...(selection === 'recommended'
			? ['--skill', 'remotion-best-practices', '--yes']
			: []),
	];

	try {
		await execa(command, args, {
			cwd: projectRoot,
			stdio: 'inherit',
		});
	} catch (e) {
		Log.error('Error installing skills:', e);
		Log.error('You can install them manually by running:');
		Log.error(`  npx ${args.join(' ')}`);
		return;
	}

	const agentsSkills = path.join(projectRoot, '.agents', 'skills');
	const claudeSkills = path.join(projectRoot, '.claude', 'skills');
	const existing = lstatSync(claudeSkills, {throwIfNoEntry: false});

	if (existing) {
		let pointsToAgentsSkills = false;
		if (existing.isSymbolicLink()) {
			try {
				pointsToAgentsSkills =
					realpathSync(claudeSkills) === realpathSync(agentsSkills);
			} catch {
				// An existing link with a missing target must be preserved.
			}
		}

		if (!pointsToAgentsSkills) {
			Log.warn(
				'Could not link .claude/skills to .agents/skills because .claude/skills already exists.',
			);
		}

		return;
	}

	try {
		mkdirSync(path.dirname(claudeSkills), {recursive: true});
		symlinkSync(
			process.platform === 'win32' ? agentsSkills : '../.agents/skills',
			claudeSkills,
			process.platform === 'win32' ? 'junction' : 'dir',
		);
	} catch (e) {
		Log.warn('Could not link .claude/skills to .agents/skills:', e);
	}
};
