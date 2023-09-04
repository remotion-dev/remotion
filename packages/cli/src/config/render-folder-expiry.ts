let renderFolderExpiry: string | null = null;

export const getRenderFolderExpiry = () => {
	return renderFolderExpiry;
};

export const setRenderFolderExpiry = (day: string | null) => {
	renderFolderExpiry = day;
};
