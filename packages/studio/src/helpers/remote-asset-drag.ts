const remoteAssetDragTypes = ['text/uri-list', 'text/html', 'text/plain'];

const isHttpUrl = (value: string): boolean => {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
};

const decodeHtmlAttribute = (value: string): string => {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
};

export const hasRemoteAssetDragData = (
	dataTransfer: DataTransfer | null,
): boolean => {
	return remoteAssetDragTypes.some((type) =>
		Array.from(dataTransfer?.types ?? []).includes(type),
	);
};

export const getRemoteAssetUrlFromUriList = (
	uriList: string,
): string | null => {
	const lines = uriList.split(/\r?\n/g);
	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed === '' || trimmed.startsWith('#')) {
			continue;
		}

		if (isHttpUrl(trimmed)) {
			return trimmed;
		}
	}

	return null;
};

export const getRemoteAssetUrlFromHtml = (html: string): string | null => {
	const imgSrc = html.match(
		/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i,
	);
	const match = imgSrc?.[1] ?? imgSrc?.[2] ?? imgSrc?.[3] ?? null;
	if (match) {
		const decoded = decodeHtmlAttribute(match.trim());
		if (isHttpUrl(decoded)) {
			return decoded;
		}
	}

	const fallback = html.match(/https?:\/\/[^\s"'<>]+/i)?.[0] ?? null;
	return fallback && isHttpUrl(fallback) ? decodeHtmlAttribute(fallback) : null;
};

export const getRemoteAssetUrlFromDataTransfer = (
	dataTransfer: DataTransfer | null,
): string | null => {
	if (!dataTransfer) {
		return null;
	}

	const uriListUrl = getRemoteAssetUrlFromUriList(
		dataTransfer.getData('text/uri-list'),
	);
	if (uriListUrl) {
		return uriListUrl;
	}

	const htmlUrl = getRemoteAssetUrlFromHtml(dataTransfer.getData('text/html'));
	if (htmlUrl) {
		return htmlUrl;
	}

	const plainText = dataTransfer.getData('text/plain').trim();
	return isHttpUrl(plainText) ? plainText : null;
};
