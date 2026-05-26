import path from 'node:path';

const formatOutsideProjectError = ({
	action,
	fileName,
	absolutePath,
	remotionRoot,
}: {
	action: string;
	fileName: string;
	absolutePath: string;
	remotionRoot: string;
}) =>
	`Cannot ${action} a file outside the project: "${fileName}" resolves to "${absolutePath}", but the project root is "${remotionRoot}".`;

export const resolveFileInsideProject = ({
	remotionRoot,
	fileName,
	action,
}: {
	remotionRoot: string;
	fileName: string;
	action: string;
}): {absolutePath: string; fileRelativeToRoot: string} => {
	const resolvedRemotionRoot = path.resolve(remotionRoot);
	const absolutePath = path.resolve(resolvedRemotionRoot, fileName);
	const fileRelativeToRoot = path.relative(resolvedRemotionRoot, absolutePath);

	if (
		fileRelativeToRoot === '..' ||
		fileRelativeToRoot.startsWith(`..${path.sep}`) ||
		path.isAbsolute(fileRelativeToRoot)
	) {
		throw new Error(
			formatOutsideProjectError({
				action,
				fileName,
				absolutePath,
				remotionRoot: resolvedRemotionRoot,
			}),
		);
	}

	return {absolutePath, fileRelativeToRoot};
};
