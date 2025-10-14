const getKey = () => {
	return `remotion_inputPropsOverride` + window.location.origin;
};

export const getInputPropsOverride = () => {
	if (typeof localStorage === 'undefined') return null;

	const override = localStorage.getItem(getKey());
	if (!override) return null;

	return JSON.parse(override);
};

export const setInputPropsOverride = (override: Record<string, unknown>) => {
	if (typeof localStorage === 'undefined') return;

	localStorage.setItem(getKey(), JSON.stringify(override));
};
