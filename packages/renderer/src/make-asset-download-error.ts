export const makeAssetDownloadError = ({
	src,
	error,
}: {
	src: string;
	error: unknown;
}) => {
	const truncatedSrc =
		src.substring(0, 1000) + (src.length > 1000 ? '...' : '');

	return new Error(
		`Error while downloading ${truncatedSrc}: ${error instanceof Error ? error.message : String(error)}`,
		{cause: error},
	);
};
