export function extractTimeoutFromURL(url: string): number | undefined {
	const firstTIndex = url.indexOf('-t');
	if (firstTIndex !== -1) {
		const substrAfterT = url.substring(firstTIndex + 2);
		const numberStr = substrAfterT.split('-')[0];
		return parseInt(numberStr, 10);
	}

	return undefined;
}
