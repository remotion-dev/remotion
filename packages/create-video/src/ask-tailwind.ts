import prompts from './prompts';

export const askTailwind = async () => {
	const {answer} = await prompts({
		type: 'toggle',
		name: 'answer',
		message: 'Add TailwindCSS?',
		initial: true,
		active: 'Yes',
		inactive: 'No',
	});

	return answer as boolean;
};
