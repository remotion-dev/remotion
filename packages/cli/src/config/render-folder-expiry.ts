let renderFolderExpiryInDays: string | null = null;

export const getRenderFolderExpiryInDays = () => {
	return renderFolderExpiryInDays;
};

export const setRenderFolderExpiryInDays = (day: string | null) => {
	renderFolderExpiryInDays = day;
};
