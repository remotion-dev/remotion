import prompts from './prompts';

export const askSkills = async () => {
	const {answer} = await prompts({
		type: 'toggle',
		name: 'answer',
		message: 'Install Claude Code skills for Remotion?',
		initial: true,
		active: 'Yes',
		inactive: 'No',
	});

	return answer as boolean;
};
