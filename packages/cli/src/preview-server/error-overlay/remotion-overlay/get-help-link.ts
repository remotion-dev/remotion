export const getHelpLink = (message: string) => {
	if (message.includes('https://remotion.dev/docs/wrong-composition-mount')) {
		return 'https://remotion.dev/docs/wrong-composition-mount';
	}

	return null;
};
