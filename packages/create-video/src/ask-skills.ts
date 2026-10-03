import {makeHyperlink} from './hyperlinks/make-link';
import {selectAsync} from './prompts';

export type SkillsInstallation = 'recommended' | 'choose';

export const askSkills = async (): Promise<SkillsInstallation | null> => {
	const link = makeHyperlink({
		text: 'agent skills',
		url: 'https://remotion.dev/docs/ai/skills',
		fallback: 'agent skills',
	});

	return (await selectAsync({
		message: `Add ${link}?`,
		initial: 0,
		choices: [
			{
				title: 'Install all skills',
				description: 'Bundled in remotion-best-practices (recommended)',
				value: 'recommended',
			},
			{
				title: 'Choose individual skills',
				description: 'Select which skills to install',
				value: 'choose',
			},
			{
				title: 'Skip skill installation',
				value: null,
			},
		],
	})) as SkillsInstallation | null;
};
