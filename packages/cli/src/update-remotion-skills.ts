import type {LogLevel} from '@remotion/renderer';
import {detectOutdatedRemotionSkills} from './detect-outdated-remotion-skills';
import {Log} from './log';
import {skillsCommand} from './skills';

export const updateRemotionSkills = async ({
	currentVersion,
	cwd,
	homeDirectory,
	skipSkills,
	logLevel,
	environment,
}: {
	currentVersion: string;
	cwd: string;
	homeDirectory: string;
	skipSkills: boolean;
	logLevel: LogLevel;
	environment: NodeJS.ProcessEnv;
}) => {
	if (skipSkills) {
		return;
	}

	const skillsStatuses = detectOutdatedRemotionSkills({
		currentVersion,
		cwd,
		homeDirectory,
	});

	if (skillsStatuses.project.type === 'outdated') {
		Log.info(
			{indent: false, logLevel},
			'Updating project Remotion Agent Skills...',
		);
		await skillsCommand(['update', '--project'], logLevel, {
			cwd,
			environment,
		});
	}
};
