import execa from 'execa';
import {Log} from './log';
import {resolve} from 'path';

export const installSkills = async (projectRoot: string) => {
	try {
		const addSkillSrcPath = resolve(__dirname, '../../add-skill/src/index.ts');
		await execa(
			'npx',
			[
				'-y',
				'tsx',
				addSkillSrcPath,
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
