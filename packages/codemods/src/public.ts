import {insertSolidIntoProject} from './index';

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

export type AddSolidOptions<Project extends CodemodProject> = {
	project: Project;
	compositionId: string;
	compositionFile: string;
	width: number;
	height: number;
	from?: number;
	position?: {x: number; y: number};
};

export const addSolid = <Project extends CodemodProject>({
	project,
	compositionId,
	compositionFile,
	width,
	height,
	from,
	position,
}: AddSolidOptions<Project>): CodemodResult<Project> => {
	const nextProject = insertSolidIntoProject({
		project,
		request: {
			compositionFile,
			compositionId,
			element: {
				height,
				position: position ?? null,
				type: 'solid',
				width,
			},
			from: from ?? null,
		},
	});
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
