export const getRemotionVersionFromIndexHtml = (
	indexHtmlContent: string,
): string | null => {
	const match = indexHtmlContent.match(
		/window\.remotion_version\s*=\s*'([^']+)'/,
	);
	return match ? match[1] : null;
};
