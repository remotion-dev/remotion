/**
 * Extracts the tweet ID from various Twitter/X URL formats
 * @param url The Twitter/X URL to extract the tweet ID from
 * @returns The tweet ID as a string, or null if no valid ID could be extracted
 */
export function extractTweetId(url: string): string | null {
	if (!url) return null;

	// Normalize the URL by trimming whitespace and converting to lowercase
	const normalizedUrl = url.trim().toLowerCase();

	// Define regex patterns for different Twitter URL formats
	const patterns = [
		// twitter.com/username/status/id
		/twitter\.com\/[^/]+\/status(?:es)?\/(\d+)/i,
		// x.com/username/status/id
		/x\.com\/[^/]+\/status(?:es)?\/(\d+)/i,
		// twitter.com/i/web/status/id
		/twitter\.com\/i\/web\/status(?:es)?\/(\d+)/i,
		// x.com/i/web/status/id
		/x\.com\/i\/web\/status(?:es)?\/(\d+)/i,
		// mobile.twitter.com/username/status/id
		/mobile\.twitter\.com\/[^/]+\/status(?:es)?\/(\d+)/i,
		// mobile.x.com/username/status/id
		/mobile\.x\.com\/[^/]+\/status(?:es)?\/(\d+)/i,
		// t.co/shortcode (this will only work if the URL has the ID directly)
		/t\.co\/[a-zA-Z0-9]+\/(\d+)/i,
		// For URLs with query parameters: ?id=123456
		/[?&]id=(\d+)/i,
	];

	// Try each pattern until we find a match
	for (const pattern of patterns) {
		const match = normalizedUrl.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	// Handle URLs that end with the ID
	const idAtEndMatch = normalizedUrl.match(/\/(\d{16,20})(?:[?#].*)?$/);
	if (idAtEndMatch && idAtEndMatch[1]) {
		return idAtEndMatch[1];
	}

	return null;
}
