export const getFolderId = ({
	folderName,
	parentName,
}: {
	folderName: string;
	parentName: string | null;
}) => {
	return [parentName, folderName].filter(Boolean).join('/');
};
