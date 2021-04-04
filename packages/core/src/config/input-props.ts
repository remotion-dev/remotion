export const getInputProps = () => {
	if (process.env.NODE_ENV === 'production') {
		const param = new URLSearchParams(window.location.search).get('props');
		if (!param) {
			return {};
		}
		const parsed = JSON.parse(decodeURIComponent(param));
		return parsed;
	}
	return (process.env.INPUT_PROPS as unknown) as object | null;
};
