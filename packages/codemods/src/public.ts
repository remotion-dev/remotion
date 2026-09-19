import type {SequenceNodePath} from 'remotion';
import {deleteJsxNode as deleteJsxNodeFromSource} from './delete-jsx-node';
import {
	findProjectFile,
	insertSolidIntoProjectWithNodePathRemappings,
} from './index';

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

const getCodemodResult = <Project extends CodemodProject>({
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

export type AddSolidOptions<Project extends CodemodProject> = {
	project: Project;
	compositionId: string;
	compositionFile: string;
	width: number;
	height: number;
	from?: number;
	position?: {x: number; y: number};
};

export type AddSolidResult<Project extends CodemodProject> =
	CodemodResult<Project> & {
		insertedNode: {
			filePath: string;
			nodePath: SequenceNodePath;
		};
	};

export const addSolid = <Project extends CodemodProject>({
	project,
	compositionId,
	compositionFile,
	width,
	height,
	from,
	position,
}: AddSolidOptions<Project>): AddSolidResult<Project> => {
	const insertion = insertSolidIntoProjectWithNodePathRemappings({
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
	const insertedNodePath = insertion.nodePathRemappings.find(
		(remapping) => remapping.oldNodePath === null,
	)?.newNodePath;
	if (!insertedNodePath) {
		throw new Error('Could not determine the inserted JSX node path');
	}

	return {
		...getCodemodResult({nextProject: insertion.project, project}),
		insertedNode: {
			filePath: insertion.filePath,
			nodePath: insertedNodePath,
		},
	};
};

export type DeleteJsxNodeOptions<Project extends CodemodProject> = {
	project: Project;
	filePath: string;
	nodePath: SequenceNodePath;
};

export const deleteJsxNode = async <Project extends CodemodProject>({
	project,
	filePath,
	nodePath,
}: DeleteJsxNodeOptions<Project>): Promise<CodemodResult<Project>> => {
	const resolvedFilePath = findProjectFile({filePath, project});
	const {output} = await deleteJsxNodeFromSource({
		input: project.files[resolvedFilePath],
		nodePath,
	});
	const nextProject = {
		...project,
		files: {
			...project.files,
			[resolvedFilePath]: output,
		},
	};

	return getCodemodResult({nextProject, project});
};
