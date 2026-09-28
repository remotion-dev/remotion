import type {CodemodProject} from './codemod-project';
import type {DuplicateNodesResult} from './duplicate-nodes';
import {getNodeProps} from './get-node-props';
import {getNodes} from './get-nodes';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getInsertedNodeReferences,
	type NodeReference,
} from './node-references';
import {splitJsxSequences} from './split-jsx-sequence';

export type SplitSequencesOptions<Project extends CodemodProject> = {
	project: Project;
	splits: {node: NodeReference; frame: number; sequenceKeys?: string[]}[];
};

export const splitSequences = async <Project extends CodemodProject>({
	project,
	splits,
}: SplitSequencesOptions<Project>): Promise<DuplicateNodesResult> => {
	if (splits.length === 0) {
		throw new Error('Expected at least one sequence to split');
	}

	const groups = new Map<string, typeof splits>();
	for (const split of splits) {
		const filePath = findProjectFile({project, filePath: split.node.filePath});
		if (split.sequenceKeys === undefined) {
			const target = getNodes({project, filePath}).find(
				(node) =>
					JSON.stringify(node.nodePath) === JSON.stringify(split.node.nodePath),
			);
			if (
				!target?.componentIdentity ||
				!/^dev\.remotion\.(remotion\.(Sequence|Video|OffthreadVideo|Audio|experimental_Video|experimental_Audio|Interactive\.[A-Za-z]+)|media\.(Video|Audio))$/.test(
					target.componentIdentity,
				)
			) {
				throw new Error(
					'Only Remotion sequences, interactive elements, and timeline media can be split',
				);
			}

			const status = getNodeProps({
				project,
				node: split.node,
				keys: ['from', 'durationInFrames', 'trimBefore'],
			});
			if (
				Object.values(status.props).some((prop) => prop.status !== 'static')
			) {
				throw new Error('Sequence timing must be static to split it');
			}
		}

		const group = groups.get(filePath) ?? [];
		if (
			group.some(
				(item) =>
					JSON.stringify(item.node.nodePath) ===
					JSON.stringify(split.node.nodePath),
			)
		) {
			throw new Error('A sequence can only be split once per call');
		}

		group.push(split);
		groups.set(filePath, group);
	}

	const edits = await Promise.all(
		[...groups].map(async ([filePath, group]) => ({
			filePath,
			...(await splitJsxSequences({
				input: project.files[filePath],
				splits: group.map(({node, frame, sequenceKeys}) => ({
					nodePath: node.nodePath,
					splitFrame: frame,
					sequenceKeys: sequenceKeys ?? [
						'from',
						'durationInFrames',
						'trimBefore',
					],
				})),
			})),
		})),
	);
	const result = getNodeEditResult({project, edits});
	return {
		...result,
		editDetails: edits.map(({filePath, nodeLabels, logLines}) => ({
			filePath,
			nodeLabels,
			logLines,
		})),
		insertedNodes: getInsertedNodeReferences(result.nodePathRemappings),
	};
};
