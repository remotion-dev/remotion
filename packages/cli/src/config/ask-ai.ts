let askAiEnabled = true;

export const setEnableAskAiFeature = (enabled: boolean) => {
	askAiEnabled = enabled;
};

export const getEnableAskAiFeature = () => {
	return askAiEnabled;
};

