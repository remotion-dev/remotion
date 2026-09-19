import type {SequenceNodePath} from 'remotion';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {insertSolidIntoProjectWithNodePathRemappings} from './internals';

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
