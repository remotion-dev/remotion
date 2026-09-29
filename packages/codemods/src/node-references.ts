import type {SequenceNodePath} from 'remotion';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {captureJsxNodePaths} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {parseAst} from './sequence-props/parse-ast';

export type NodeReference = {
	filePath: string;
	nodePath: SequenceNodePath;
};

export type NodePathRemapping = {
	filePath: string;
	oldNodePath: SequenceNodePath | null;
	newNodePath: SequenceNodePath | null;
};

export type CodemodNodeResult = CodemodResult & {
	nodePathRemappings: NodePathRemapping[];
};

export type CodemodInsertionResult = CodemodNodeResult & {
	insertedNode: NodeReference;
};

export type NodeSourceEdit = {
	filePath: string;
	output: string;
	nodePathRemappings: {
		oldNodePath: SequenceNodePath | null;
		newNodePath: SequenceNodePath | null;
	}[];
};

export const getInsertedNodeReferences = (
	remappings: NodePathRemapping[],
): NodeReference[] => {
	const inserted = remappings.flatMap(({filePath, oldNodePath, newNodePath}) =>
		oldNodePath === null && newNodePath !== null
			? [{filePath, nodePath: newNodePath}]
			: [],
	);
	return inserted.filter(
		(node) =>
			!inserted.some((parent) => {
				if (parent === node || parent.filePath !== node.filePath) return false;
				const prefix = parent.nodePath.slice(0, -1);
				return (
					prefix.length < node.nodePath.length &&
					prefix.every((part, index) => node.nodePath[index] === part)
				);
			}),
	);
};

export const getNodeEditResult = ({
	project,
	edits,
}: {
	project: CodemodProject;
	edits: NodeSourceEdit[];
}): CodemodNodeResult => {
	return {
		...getCodemodResult({
			project,
			edits: edits.map(({filePath, output}) => ({
				filePath,
				nextContents: output,
			})),
		}),
		nodePathRemappings: edits.flatMap(({filePath, nodePathRemappings}) =>
			nodePathRemappings.map((remapping) => ({filePath, ...remapping})),
		),
	};
};

// Props, effects, and keyframe edits preserve JSX traversal order. Hooks and
// statements they insert can still change the paths of every node in a function.
export const getUnchangedStructureRemappings = ({
	input,
	output,
}: {
	input: string;
	output: string;
}): NodeSourceEdit['nodePathRemappings'] => {
	const before = captureJsxNodePaths(parseAst(input));
	const after = captureJsxNodePaths(parseAst(output));
	if (before.length !== after.length) {
		throw new Error('The edit unexpectedly changed the JSX structure');
	}

	return before.flatMap((node, index) => {
		const next = after[index];
		if (
			JSON.stringify(node.nodePath) === JSON.stringify(next.nodePath) &&
			node.signature === next.signature
		) {
			return [];
		}

		return [{oldNodePath: node.nodePath, newNodePath: next.nodePath}];
	});
};

export const getUpdatedNodeReference = ({
	project,
	node,
	nodePathRemappings,
}: {
	project: CodemodProject;
	node: NodeReference;
	nodePathRemappings: NodePathRemapping[];
}): NodeReference => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const remapping = nodePathRemappings.find(
		(entry) =>
			entry.filePath === filePath &&
			JSON.stringify(entry.oldNodePath) === JSON.stringify(node.nodePath),
	);
	if (remapping?.newNodePath === null) {
		throw new Error('The JSX node was removed');
	}

	return {filePath, nodePath: remapping?.newNodePath ?? node.nodePath};
};

export const groupNodeReferencesByFile = ({
	project,
	nodes,
}: {
	project: CodemodProject;
	nodes: NodeReference[];
}) => {
	if (nodes.length === 0) {
		throw new Error('Expected at least one JSX node');
	}

	const groups = new Map<string, SequenceNodePath[]>();
	for (const node of nodes) {
		const filePath = findProjectFile({project, filePath: node.filePath});
		const paths = groups.get(filePath) ?? [];
		if (
			!paths.some(
				(path) => JSON.stringify(path) === JSON.stringify(node.nodePath),
			)
		) {
			paths.push(node.nodePath);
		}

		groups.set(filePath, paths);
	}

	return groups;
};
