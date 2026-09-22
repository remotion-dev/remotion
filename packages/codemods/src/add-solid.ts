import type {CodemodProject} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {insertSolidIntoProjectWithNodePathRemappings} from './internals';
import type {CodemodInsertionResult} from './node-references';

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
	CodemodInsertionResult<Project>;

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
		nodePathRemappings: insertion.nodePathRemappings.map((remapping) => ({
			filePath: insertion.filePath,
			...remapping,
		})),
		insertedNode: {
			filePath: insertion.filePath,
			nodePath: insertedNodePath,
		},
	};
};
