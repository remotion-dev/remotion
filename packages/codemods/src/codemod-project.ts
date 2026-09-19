export type CodemodProject = {
	files: Record<string, string>;
	rootDir: string;
};

export type CodemodFileChange = {
	filePath: string;
	previousContents: string | null;
	nextContents: string | null;
};

export type CodemodResult<Project extends CodemodProject> = {
	project: Project;
	changes: CodemodFileChange[];
};

export const getCodemodResult = <Project extends CodemodProject>({
	project,
	nextProject,
}: {
	project: Project;
	nextProject: Project;
}): CodemodResult<Project> => {
	const filePaths = new Set([
		...Object.keys(project.files),
		...Object.keys(nextProject.files),
	]);
	const changes = [...filePaths].flatMap((filePath): CodemodFileChange[] => {
		const previousContents = project.files[filePath] ?? null;
		const nextContents = nextProject.files[filePath] ?? null;
		return previousContents === nextContents
			? []
			: [{filePath, previousContents, nextContents}];
	});

	return {changes, project: nextProject};
};
