import execa from 'execa';
import {Log} from './log';

export const installSkills = async (projectRoot: string) => {
	try {
		await execa('npx', ['-y', 'add-skill', 'remotion-dev/skills'], {
			cwd: projectRoot,
			stdio: 'inherit',
		});
	} catch (e) {
		Log.error('Error installing skills:', e);
		Log.error('You can install them manually by running:');
		Log.info('  npx add-skill remotion-dev/skills');
	}
};
