export type THelpLink = {
	url: string;
	title: string;
};

export const getHelpLink = (message: string): THelpLink | null => {
	if (
		message.includes(
			'See https://www.remotion.dev/docs/the-fundamentals#defining-compositions'
		)
	) {
		return {
			title: 'Defining compositions',
			url: 'See https://www.remotion.dev/docs/the-fundamentals#defining-compositions',
		};
	}

	if (message.includes('https://remotion.dev/docs/wrong-composition-mount')) {
		return {
			title: 'Wrongly mounted <Composition>',
			url: 'https://remotion.dev/docs/wrong-composition-mount',
		};
	}

	return null;
};
