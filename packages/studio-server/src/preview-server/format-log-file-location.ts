import path from 'node:path';

export const formatLogFileLocation = ({
	remotionRoot,
	absolutePath,
	line,
}: {
	remotionRoot: string;
	absolutePath: string;
	line: number;
}): string => {
	return `${path.relative(remotionRoot, absolutePath)}:${line}`;
};
