const invalidCharacters = ['?', '*', '+', ':', '%'];

export const getDefaultCaptionOutputName = (
	src: string,
	displayName = 'captions',
): string => {
	let pathname = displayName;
	if (!/^(data|blob):/i.test(src.trimStart())) {
		pathname = src.split(/[?#]/)[0] ?? src;
		try {
			pathname = new URL(
				src,
				typeof window === 'undefined'
					? 'http://localhost'
					: window.location.href,
			).pathname;
		} catch {
			// Fall back to the source as-is if it cannot be parsed as a URL.
		}
	}

	const lastPathSegment = pathname.split('/').filter(Boolean).at(-1);
	let decoded = lastPathSegment ?? 'captions';
	try {
		decoded = decodeURIComponent(decoded);
	} catch {
		// Keep the encoded name if it contains an invalid escape sequence.
	}

	const withoutExtension = decoded.replace(/\.[^/.]+$/, '');
	const safeBaseName = withoutExtension
		.replace(/[^a-zA-Z0-9-_ ]/g, '-')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/^-+|-+$/g, '');

	return `${safeBaseName || 'captions'}-captions.json`;
};

export const validateCaptionOutputName = (outName: string): string | null => {
	if (outName.trim() === '') {
		return 'Enter an output file';
	}

	if (outName !== outName.trim()) {
		return 'The output file must not start or end with whitespace';
	}

	if (outName.startsWith('/') || /^[a-zA-Z]:/.test(outName)) {
		return 'The output file must be relative to the public folder';
	}

	if (outName.includes('\\')) {
		return 'Use forward slashes in the output file';
	}

	if (outName.includes('\0')) {
		return 'The output file must not contain null characters';
	}

	const segments = outName.split('/');
	if (segments.some((segment) => segment === '')) {
		return 'The output file must not contain empty path segments';
	}

	if (segments.some((segment) => segment === '.')) {
		return 'The output file must not contain "." path segments';
	}

	if (segments.some((segment) => segment.startsWith('..'))) {
		return 'The output file must stay inside the public folder';
	}

	const invalidCharacter = invalidCharacters.find((character) =>
		outName.includes(character),
	);
	if (invalidCharacter) {
		return `The output file must not contain "${invalidCharacter}"`;
	}

	if (!outName.toLowerCase().endsWith('.json')) {
		return 'The output file must end in .json';
	}

	return null;
};
