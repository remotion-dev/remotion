export type CodemodProject = {
	files: Record<string, string>;
	rootDir: string;
};

export type CodemodFileChange = {
	filePath: string;
	previousContents: string | null;
	nextContents: string | null;
};

export type CodemodResult = {
	changes: CodemodFileChange[];
};

export const getCodemodResult = ({
	project,
	edits,
}: {
	project: CodemodProject;
	edits: {filePath: string; nextContents: string | null}[];
}): CodemodResult => {
	const seen = new Set<string>();
	const changes = edits.flatMap(
		({filePath, nextContents}): CodemodFileChange[] => {
			if (seen.has(filePath)) {
				throw new Error(`Multiple edits for ${filePath}`);
			}

			seen.add(filePath);
			const previousContents = project.files[filePath] ?? null;
			return previousContents === nextContents
				? []
				: [{filePath, previousContents, nextContents}];
		},
	);

	return {changes};
};

export const applyCodemodChanges = <Project extends CodemodProject>(
	project: Project,
	changes: readonly CodemodFileChange[],
): Project => {
	if (changes.length === 0) {
		return project;
	}

	const seen = new Set<string>();
	for (const {filePath, previousContents} of changes) {
		if (seen.has(filePath)) {
			throw new Error(`Multiple changes for ${filePath}`);
		}

		seen.add(filePath);
		if ((project.files[filePath] ?? null) !== previousContents) {
			throw new Error(`Source changed before applying codemod: ${filePath}`);
		}
	}

	const files = {...project.files};
	for (const {filePath, nextContents} of changes) {
		if (nextContents === null) {
			delete files[filePath];
		} else {
			files[filePath] = nextContents;
		}
	}

	return {...project, files};
};
