const getKey = () => {
	return `remotion_inputPropsOverride` + window.location.origin;
};

export const getInputPropsOverride = (): Record<string, unknown> | null => {
	if (typeof localStorage === 'undefined') return null;

	const override = localStorage.getItem(getKey());
	if (!override) return null;

	return JSON.parse(override);
};

export const setInputPropsOverride = (
	override: Record<string, unknown> | null,
) => {
	if (typeof localStorage === 'undefined') return;

	if (override === null) {
		localStorage.removeItem(getKey());
		return;
	}

	localStorage.setItem(getKey(), JSON.stringify(override));
};
