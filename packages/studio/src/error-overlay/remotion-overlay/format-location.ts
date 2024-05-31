export const formatLocation = (location: string) => {
	if (location.startsWith('webpack://')) {
		return location.replace('webpack://', '');
	}

	return location;
};
