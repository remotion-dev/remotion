import type {GitSource} from './git-source';

export const getProjectName = ({
	gitSource,
	resolvedRemotionRoot,
	basename,
}: {
	gitSource: GitSource | null;
	resolvedRemotionRoot: string;
	basename: (str: string) => string;
}) => {
	// Directory name
	if (!gitSource) {
		return basename(resolvedRemotionRoot);
	}

	// Subfolder name of a Git repo, e.g `example`
	if (gitSource.relativeFromGitRoot.trim()) {
		return basename(gitSource.relativeFromGitRoot.trim());
	}

	// Name of the repo
	return gitSource.name;
};
