import path from 'node:path';

export const validateImageSequencePattern = (pattern: string | null) => {
	if (pattern === null) {
		return;
	}

	const segments = pattern.split(/[/\\]/);

	if (
		!pattern.includes('[frame]') ||
		segments.includes('..') ||
		path.isAbsolute(pattern) ||
		path.win32.isAbsolute(pattern) ||
		Array.from(pattern).some((character) => character.charCodeAt(0) < 32)
	) {
		throw new Error(
			'imageSequencePattern must contain [frame] and must not be an absolute path or contain ".." segments',
		);
	}
};
