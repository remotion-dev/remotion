import type {File} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	getJsxNodesWithPaths,
	type CapturedJsxNodePath,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {getJsxSourceLocation} from './recast-loc-to-offset';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';

export type NodeReference = {
	filePath: string;
	nodePath: SequenceNodePath;
};

export type NodePathRemapping = SequenceNodePathRemapping & {
	filePath: string;
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
	nodePathRemappings: SequenceNodePathRemapping[];
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

const isUnchangedNode = (
	node: CapturedJsxNodePath,
	next: CapturedJsxNodePath,
): boolean =>
	JSON.stringify(node.nodePath) === JSON.stringify(next.nodePath) &&
	node.signature === next.signature;

const nodesByAst = new WeakMap<File, ReturnType<typeof getJsxNodesWithPaths>>();
const getSourceNodes = (source: string) => {
	const {ast} = getReadOnlySourceSnapshot(source);
	const cached = nodesByAst.get(ast);
	if (cached) return cached;
	const nodes = getJsxNodesWithPaths(ast);
	nodesByAst.set(ast, nodes);
	return nodes;
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
	const before = getSourceNodes(input);
	const after = getSourceNodes(output);
	if (before.length !== after.length) {
		throw new Error('The edit unexpectedly changed the JSX structure');
	}

	return before.flatMap((node, index) => {
		const next = after[index];
		const unchanged =
			JSON.stringify(node.nodePath) === JSON.stringify(next.nodePath) &&
			recast.prettyPrint(node.node).code === recast.prettyPrint(next.node).code;
		return unchanged
			? []
			: [
					{
						oldNodePath: node.nodePath.slice(),
						newNodePath: next.nodePath.slice(),
					},
				];
	});
};

export const getKeyframeSourceLocationRemappings = ({
	input,
	output,
	remappings,
}: {
	input: string;
	output: string;
	remappings: SequenceNodePathRemapping[];
}): SequenceNodePathRemapping[] => {
	const result = remappings.slice();
	const oldPathIndices = new Map(
		remappings.map((m, i) => [JSON.stringify(m.oldNodePath), i]),
	);
	const destinations = new Set(
		remappings.map((m) => JSON.stringify(m.newNodePath)),
	);
	const finalOpenings = new Map(
		getSourceNodes(output).map(({nodePath, node}) => [
			JSON.stringify(nodePath),
			node,
		]),
	);
	for (const {nodePath, node} of getSourceNodes(input)) {
		const oldKey = JSON.stringify(nodePath);
		const index = oldPathIndices.get(oldKey);
		const remapping = index === undefined ? null : remappings[index];
		if (!remapping && destinations.has(oldKey)) continue;
		const newKey = remapping ? JSON.stringify(remapping.newNodePath) : oldKey;
		const final = finalOpenings.get(newKey);
		if (!node.loc || !final?.loc) continue;
		const before = getJsxSourceLocation(input, node.loc.start);
		const after = getJsxSourceLocation(output, final.loc.start);
		if (
			oldKey === newKey &&
			before.line === after.line &&
			before.column === after.column
		)
			continue;
		const sourceLocations = {before, after};
		if (index !== undefined) {
			result[index] = {...remappings[index], sourceLocations};
		} else {
			result.push({
				oldNodePath: nodePath.slice(),
				newNodePath: nodePath.slice(),
				sourceLocations,
			});
		}
	}

	return result;
};

// Registration edits insert, remove, or move whole JSX subtrees while the
// remaining nodes keep their document order.
export const getSubtreeEditRemappings = ({
	before,
	after,
	subtrees,
}: {
	before: CapturedJsxNodePath[];
	after: CapturedJsxNodePath[];
	// Matched separately from the remaining nodes. A subtree without `before`
	// nodes was inserted, a subtree without `after` nodes was removed.
	subtrees: {before: ReadonlySet<object>; after: ReadonlySet<object>}[];
}): NodeSourceEdit['nodePathRemappings'] => {
	const remainingBefore = before.filter(
		({node}) => !subtrees.some((subtree) => subtree.before.has(node)),
	);
	const remainingAfter = after.filter(
		({node}) => !subtrees.some((subtree) => subtree.after.has(node)),
	);
	if (remainingBefore.length !== remainingAfter.length) {
		throw new Error(
			'Could not remap JSX nodes after editing the registrations',
		);
	}

	const pairs: {
		node: CapturedJsxNodePath | null;
		next: CapturedJsxNodePath | null;
	}[] = remainingBefore.map((node, index) => ({
		node,
		next: remainingAfter[index],
	}));
	for (const subtree of subtrees) {
		const nodes = before.filter(({node}) => subtree.before.has(node));
		const nextNodes = after.filter(({node}) => subtree.after.has(node));
		if (
			nodes.length > 0 &&
			nextNodes.length > 0 &&
			nodes.length !== nextNodes.length
		) {
			throw new Error(
				'Could not remap JSX nodes after editing the registrations',
			);
		}

		for (let i = 0; i < Math.max(nodes.length, nextNodes.length); i++) {
			pairs.push({node: nodes[i] ?? null, next: nextNodes[i] ?? null});
		}
	}

	return pairs.flatMap(({node, next}) =>
		node !== null && next !== null && isUnchangedNode(node, next)
			? []
			: [
					{
						oldNodePath: node?.nodePath ?? null,
						newNodePath: next?.nodePath ?? null,
					},
				],
	);
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

export const getUpdatedNodeReferences = ({
	project,
	nodes,
	nodePathRemappings,
}: {
	project: CodemodProject;
	nodes: readonly NodeReference[];
	nodePathRemappings: NodePathRemapping[];
}): NodeReference[] => {
	if (nodes.length === 1) {
		return [
			getUpdatedNodeReference({project, node: nodes[0], nodePathRemappings}),
		];
	}

	const pathsByFile = new Map<string, Map<string, SequenceNodePath | null>>();
	for (const {filePath, oldNodePath, newNodePath} of nodePathRemappings) {
		if (oldNodePath === null) {
			continue;
		}

		const paths =
			pathsByFile.get(filePath) ?? new Map<string, SequenceNodePath | null>();
		const key = JSON.stringify(oldNodePath);
		// Match the first remapping, as the single-node lookup does.
		if (!paths.has(key)) {
			paths.set(key, newNodePath);
		}

		pathsByFile.set(filePath, paths);
	}

	return nodes.map((node) => {
		const filePath = findProjectFile({project, filePath: node.filePath});
		const nodePath = pathsByFile
			.get(filePath)
			?.get(JSON.stringify(node.nodePath));
		if (nodePath === null) {
			throw new Error('The JSX node was removed');
		}

		return {filePath, nodePath: nodePath ?? node.nodePath};
	});
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
	const seenPathsByFile = new Map<string, Set<string>>();
	for (const node of nodes) {
		const filePath = findProjectFile({project, filePath: node.filePath});
		const paths = groups.get(filePath) ?? [];
		const seenPaths = seenPathsByFile.get(filePath) ?? new Set<string>();
		const key = JSON.stringify(node.nodePath);
		if (!seenPaths.has(key)) {
			paths.push(node.nodePath);
			seenPaths.add(key);
		}

		groups.set(filePath, paths);
		seenPathsByFile.set(filePath, seenPaths);
	}

	return groups;
};
