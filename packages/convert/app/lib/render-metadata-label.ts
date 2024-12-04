export const renderMetadataLabel = (key: string) => {
	if (key === 'com.apple.quicktime.location.accuracy.horizontal') {
		return 'Location Accuracy (Horizontal)';
	}

	return key;
};
