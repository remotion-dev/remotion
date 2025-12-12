let experimentalClientSideRenderingEnabled = false;

export const setExperimentalClientSideRenderingEnabled = (
	enabled: boolean,
) => {
	experimentalClientSideRenderingEnabled = enabled;
};

export const getExperimentalClientSideRenderingEnabled = () => {
	return experimentalClientSideRenderingEnabled;
};
