import type {CodemodProject} from './codemod-project';
import {duplicateJsxNodes as duplicateNodesInSource} from './duplicate-jsx-node';
import {getJsxNodes} from './get-jsx-nodes';
import {findProjectFile} from './internals';
import {getJsxNodeProps} from './jsx-props';
import {
	getNodeEditResult,
	getInsertedNodeReferences,
	getUpdatedNodeReference,
	groupNodeReferencesByFile,
	type CodemodNodeResult,
	type JsxNodeReference,
} from './node-references';
import {reorderSequence} from './reorder-sequence';
import {splitJsxSequences} from './split-jsx-sequence';
import {splitVideoFromAudio} from './split-video-from-audio';

export type DuplicateJsxNodesOptions<Project extends CodemodProject> = {
	project: Project;
	nodes: JsxNodeReference[];
};

export type DuplicateJsxNodesResult<Project extends CodemodProject> =
	CodemodNodeResult<Project> & {
		insertedNodes: JsxNodeReference[];
	};

export const duplicateJsxNodes = async <Project extends CodemodProject>({
	project,
	nodes,
}: DuplicateJsxNodesOptions<Project>): Promise<
	DuplicateJsxNodesResult<Project>
> => {
	const groups = groupNodeReferencesByFile({project, nodes});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, nodePaths]) => ({
			filePath,
			...(await duplicateNodesInSource({
				input: project.files[filePath],
				nodePaths,
			})),
		})),
	);
	const result = getNodeEditResult({project, edits});
	return {
		...result,
		insertedNodes: getInsertedNodeReferences(result.nodePathRemappings),
	};
};

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
	return {...result, updatedNode: getUpdatedNodeReference({...result, node})};
};

export type SplitSequencesOptions<Project extends CodemodProject> = {
	project: Project;
	splits: {node: JsxNodeReference; frame: number}[];
};

export const splitSequences = async <Project extends CodemodProject>({
	project,
	splits,
}: SplitSequencesOptions<Project>): Promise<
	DuplicateJsxNodesResult<Project>
> => {
	if (splits.length === 0) {
		throw new Error('Expected at least one sequence to split');
	}

	const groups = new Map<string, typeof splits>();
	for (const split of splits) {
		const filePath = findProjectFile({project, filePath: split.node.filePath});
		const target = getJsxNodes({project, filePath}).find(
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

		const status = getJsxNodeProps({
			project,
			node: split.node,
			keys: ['from', 'durationInFrames', 'trimBefore'],
		});
		if (Object.values(status.props).some((prop) => prop.status !== 'static')) {
			throw new Error('Sequence timing must be static to split it');
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
				splits: group.map(({node, frame}) => ({
					nodePath: node.nodePath,
					splitFrame: frame,
					sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
				})),
			})),
		})),
	);
	const result = getNodeEditResult({project, edits});
	return {
		...result,
		insertedNodes: getInsertedNodeReferences(result.nodePathRemappings),
	};
};

export type DetachAudioOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
};

export const detachAudio = async <Project extends CodemodProject>({
	project,
	node,
}: DetachAudioOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const target = getJsxNodes({project, filePath}).find(
		(entry) => JSON.stringify(entry.nodePath) === JSON.stringify(node.nodePath),
	);
	if (
		!target?.componentIdentity ||
		!/^dev\.remotion\.(remotion\.(Video|OffthreadVideo|experimental_Video)|media\.Video)$/.test(
			target.componentIdentity,
		)
	) {
		throw new Error('Audio can only be detached from a Remotion video element');
	}

	const edit = await splitVideoFromAudio({
		input: project.files[filePath],
		nodePath: node.nodePath,
	});
	const result = getNodeEditResult({project, edits: [{filePath, ...edit}]});
	const nodePath = edit.nodePathRemappings.find(
		(entry) => entry.oldNodePath === null,
	)?.newNodePath;
	if (!nodePath) {
		throw new Error('Could not locate the detached audio element');
	}

	return {
		...result,
		insertedNode: {filePath, nodePath},
		updatedNode: getUpdatedNodeReference({...result, node}),
	};
};
