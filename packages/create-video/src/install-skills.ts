import {lstatSync, mkdirSync, readlinkSync, symlinkSync} from 'node:fs';
import path from 'node:path';
import execa from 'execa';
import {Log} from './log';

export const installSkills = async (projectRoot: string) => {
	const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';

	try {
		await execa(
			command,
			[
				'-y',
				'--loglevel=error',
				'skills@1.7.0',
				'add',
				'remotion-dev/skills',
				'--agent',
				'codex',
				'--yes',
			],
			{
				cwd: projectRoot,
				stdio: 'inherit',
			},
		);
	} catch (e) {
		Log.error('Error installing skills:', e);
		Log.error('You can install them manually by running:');
		Log.error('  npx skills@1.7.0 add remotion-dev/skills --agent codex --yes');
		return;
	}

	const claudeSkills = path.join(projectRoot, '.claude', 'skills');
	const existing = lstatSync(claudeSkills, {throwIfNoEntry: false});

	if (existing) {
		if (
			!existing.isSymbolicLink() ||
			readlinkSync(claudeSkills) !== '../.agents/skills'
		) {
			Log.warn(
				'Could not link .claude/skills to .agents/skills because .claude/skills already exists.',
			);
		}

		return;
	}

	try {
		mkdirSync(path.dirname(claudeSkills), {recursive: true});
		symlinkSync('../.agents/skills', claudeSkills, 'dir');
	} catch (e) {
		Log.warn('Could not link .claude/skills to .agents/skills:', e);
	}
};
