let enableFolderExpiry: boolean | null = null;

export const getEnableFolderExpiry = () => {
	return enableFolderExpiry;
};

export const setEnableFolderExpiry = (value: boolean | null) => {
	enableFolderExpiry = value;
};
