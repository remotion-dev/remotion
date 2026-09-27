import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';
import {reorderSequence} from './reorder-sequence';

export type ReorderNodeOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	target: NodeReference;
	position: 'before' | 'after';
};

export const reorderNode = async <Project extends CodemodProject>({
	project,
	node,
	target,
	position,
}: ReorderNodeOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	if (filePath !== findProjectFile({project, filePath: target.filePath})) {
		throw new Error(
			'JSX nodes must be siblings in the same file to reorder them',
		);
	}

	const edit = await reorderSequence({
		input: project.files[filePath],
		sourceNodePath: node.nodePath,
		targetNodePath: target.nodePath,
		position,
	});
	const result = getNodeEditResult({project, edits: [{filePath, ...edit}]});
	return {
		...result,
		editDetails: [
			{
				filePath,
				formatted: edit.formatted,
				sequenceLabel: edit.sequenceLabel,
				logLine: edit.logLine,
			},
		],
		updatedNode: getUpdatedNodeReference({project, ...result, node}),
	};
};
