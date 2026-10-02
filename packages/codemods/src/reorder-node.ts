import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';
import {reorderSequences} from './reorder-sequence';

export type ReorderNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: readonly NodeReference[];
	target: NodeReference;
	position: 'before' | 'after';
};

export type ReorderNodeOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	target: NodeReference;
	position: 'before' | 'after';
};

export const reorderNodes = async <Project extends CodemodProject>({
	project,
	nodes,
	target,
	position,
}: ReorderNodesOptions<Project>) => {
	if (nodes.length === 0) {
		throw new Error('Expected at least one JSX node to reorder');
	}

	const filePath = findProjectFile({project, filePath: target.filePath});
	if (
		nodes.some(
			(node) =>
				filePath !== findProjectFile({project, filePath: node.filePath}),
		)
	) {
		throw new Error(
			'JSX nodes must be siblings in the same file to reorder them',
		);
	}

	const edit = await reorderSequences({
		input: project.files[filePath],
		sourceNodePaths: nodes.map((node) => node.nodePath),
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
		updatedNodes: nodes.map((node) =>
			getUpdatedNodeReference({project, ...result, node}),
		),
	};
};

export const reorderNode = async <Project extends CodemodProject>({
	project,
	node,
	target,
	position,
}: ReorderNodeOptions<Project>) => {
	const result = await reorderNodes({
		project,
		nodes: [node],
		target,
		position,
	});
	return {...result, updatedNode: result.updatedNodes[0]};
};
