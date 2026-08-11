export const isTwoslashEnabled = (): boolean => {
	if (process.env.REMOTION_DOCS_ENABLE_TWOSLASH === '1') {
		return true;
	}

	return process.env.REMOTION_DOCS_DISABLE_TWOSLASH !== '1';
};
