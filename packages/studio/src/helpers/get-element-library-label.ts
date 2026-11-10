export const getElementLibraryLabel = ({
	url,
	displayName,
}: {
	url: string;
	displayName: string | null;
}): string => {
	if (displayName !== null) {
		return displayName;
	}

	const parsedUrl = new URL(url);
	return `${parsedUrl.host}${parsedUrl.pathname.replace(/\/$/, '')}`;
};
