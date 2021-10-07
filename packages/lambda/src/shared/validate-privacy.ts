export function validatePrivacy(
	privacy: unknown
): asserts privacy is 'private' | 'public' {
	if (typeof privacy !== 'string') {
		throw new TypeError('Privacy must be a string');
	}

	if (privacy !== 'private' && privacy !== 'public') {
		throw new TypeError('Privacy must be either "private" or "public-read"');
	}
}
