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
				'add-skill@1.0.20',
				'remotion-dev/skills',
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
		Log.error('  npx add-skill remotion-dev/skills');
	}
};
