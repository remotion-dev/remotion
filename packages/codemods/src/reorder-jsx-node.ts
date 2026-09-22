import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUpdatedNodeReference,
	type JsxNodeReference,
} from './node-references';
import {reorderSequence} from './reorder-sequence';

export type ReorderJsxNodeOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
	target: JsxNodeReference;
	position: 'before' | 'after';
};

export const reorderJsxNode = async <Project extends CodemodProject>({
	project,
	node,
	target,
	position,
}: ReorderJsxNodeOptions<Project>) => {
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
		updatedNode: getUpdatedNodeReference({...result, node}),
	};
};
