export type THelpLink = {
	url: string;
	title: string;
};

export const getHelpLink = (message: string): THelpLink | null => {
	if (message.includes('https://remotion.dev/docs/wrong-composition-mount')) {
		return {
			title: 'Wrongly mounted <Composition>',
			url: 'https://remotion.dev/docs/wrong-composition-mount',
		};
	}

	return null;
};
