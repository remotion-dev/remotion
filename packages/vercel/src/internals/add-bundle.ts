export const REMOTION_SANDBOX_BUNDLE_DIR = 'remotion-bundle';

export const toPosixPath = (filePath: string): string => {
	return filePath.split(/[/\\]/).join('/');
};

export const getAncestorDirectories = (relativePath: string): string[] => {
	const normalized = toPosixPath(relativePath);
	const parts = normalized.split('/').filter(Boolean);
	const dirs: string[] = [];

	for (let i = 0; i < parts.length - 1; i++) {
		dirs.push(parts.slice(0, i + 1).join('/'));
	}

	return dirs;
};

export const toSandboxBundlePath = (relativePath: string): string => {
	return `${REMOTION_SANDBOX_BUNDLE_DIR}/${toPosixPath(relativePath)}`;
};
