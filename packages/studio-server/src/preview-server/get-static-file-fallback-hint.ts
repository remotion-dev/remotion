import {existsSync, statSync} from 'node:fs';
import path from 'node:path';

type GetStaticFileFallbackHintInput = {
	method: string | undefined;
	pathname: string;
	publicDir: string;
};

export const getStaticFileFallbackHint = ({
	method,
	pathname,
	publicDir,
}: GetStaticFileFallbackHintInput): string | null => {
	if (method !== 'GET' && method !== 'HEAD') {
		return null;
	}

	let normalizedPathname: string;
	try {
		normalizedPathname = decodeURIComponent(pathname);
	} catch {
		return null;
	}

	if (normalizedPathname === '/' || !path.extname(normalizedPathname)) {
		return null;
	}

	const relativePath = normalizedPathname.replace(/^\/+/, '');
	if (!relativePath) {
		return null;
	}

	const resolvedPublicDir = path.resolve(publicDir);
	const filePath = path.resolve(publicDir, relativePath);
	const relativeToPublicDir = path.relative(resolvedPublicDir, filePath);

	try {
		if (
			relativeToPublicDir.startsWith('..') ||
			path.isAbsolute(relativeToPublicDir) ||
			!existsSync(filePath) ||
			statSync(filePath).isDirectory()
		) {
			return null;
		}
	} catch {
		return null;
	}

	return relativePath;
};
