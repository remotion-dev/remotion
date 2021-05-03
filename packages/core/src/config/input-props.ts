export const INPUT_PROPS_KEY = 'remotion.inputProps';

export const getInputProps = () => {
	if (process.env.NODE_ENV === 'production') {
		const param = localStorage.getItem(INPUT_PROPS_KEY);
		if (!param) {
			return {};
		}

		const parsed = JSON.parse(param);
		return parsed;
	}

	return (process.env.INPUT_PROPS as unknown) as object | null;
};
