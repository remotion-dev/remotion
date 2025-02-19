export function extractMemoryFromURL(url: string): string | undefined {
	const regex = /mem(.*?)-/;
	const match = url.match(regex);
	return match ? match[1] : undefined;
}
