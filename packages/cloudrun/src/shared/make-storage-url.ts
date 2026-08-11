export const makeStorageServeUrl = ({
	bucketName,
	subFolder,
}: {
	bucketName: string;
	subFolder: string;
}): string => {
	return `https://storage.googleapis.com/${bucketName}/${subFolder}/index.html`;
};
