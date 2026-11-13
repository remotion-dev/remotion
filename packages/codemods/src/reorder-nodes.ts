import type {TrackMoveTiming} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {moveNodesIntoTrack} from './move-nodes-into-track';
import {
	getNodeEditResult,
	getUpdatedNodeReferences,
	type NodeReference,
} from './node-references';
import {reorderSequences} from './reorder-sequence';

export type NodeMoveTiming = TrackMoveTiming;

export type ReorderNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: readonly NodeReference[];
	target: NodeReference;
} & (
	| {position: 'before' | 'after'}
	| {position: 'inside'; timings: readonly NodeMoveTiming[]}
);

export const reorderNodes = async <Project extends CodemodProject>(
	options: ReorderNodesOptions<Project>,
) => {
	const {project, nodes, target, position} = options;
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

	const edit =
		position === 'inside'
			? moveNodesIntoTrack({
					input: project.files[filePath],
					sourceNodePaths: nodes.map((node) => node.nodePath),
					targetNodePath: target.nodePath,
					timings: options.timings,
				})
			: await reorderSequences({
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
				formatted: 'formatted' in edit ? edit.formatted : true,
				sequenceLabel: edit.sequenceLabel,
				logLine: edit.logLine,
			},
		],
		updatedNodes: getUpdatedNodeReferences({project, ...result, nodes}),
	};
};
