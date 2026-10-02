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
		'skills@1.5.26',
		'add',
		'remotion-dev/skills',
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
	}
};
