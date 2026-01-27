import {makeHyperlink} from './hyperlinks/make-link';
import prompts from './prompts';

export const askSkills = async () => {
	const link = makeHyperlink({
		text: 'agent skills',
		url: 'https://remotion.dev/docs/ai/skills',
		fallback: 'agent skills',
	});

	const {answer} = await prompts({
		type: 'toggle',
		name: 'answer',
		message: `Add ${link}?`,
		initial: false,
		active: 'Yes',
		inactive: 'No',
	});

	return answer as boolean;
};
