import {readFileSync} from 'node:fs';

export const readSourceFile = ({
	absolutePath,
	fileContentsCache,
}: {
	absolutePath: string;
	fileContentsCache: Map<string, string> | null;
}): string => {
	const cachedContents = fileContentsCache?.get(absolutePath);
	if (cachedContents !== undefined) {
		return cachedContents;
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');
	fileContentsCache?.set(absolutePath, fileContents);
	return fileContents;
};
