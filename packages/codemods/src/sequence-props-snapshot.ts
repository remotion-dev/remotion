import type {File, Node} from '@babel/types';
import * as recast from 'recast';
import {parseAst} from './sequence-props/parse-ast';
import type {VideoConfigIdentifierValues} from './sequence-props/video-config-values';

type SourceSnapshot = {
	ast: File;
	videoConfigIdentifierValues: VideoConfigIdentifierValues | null;
};

// Public reads share immutable source snapshots, including across the awaits in
// Studio's read/edit/write/status workflow. Content keys make external writes,
// caption edits, keyframe edits, and retained project versions independent.
const snapshots = new Map<string, SourceSnapshot>();
const maximumSnapshots = 8;
const readOnlyNodePaths = new WeakMap<
	File,
	Map<Node, recast.types.NodePath> | null
>();

export const getReadOnlySourceSnapshot = (input: string): SourceSnapshot => {
	let snapshot = snapshots.get(input);
	if (!snapshot) {
		snapshot = {
			ast: parseAst(input),
			videoConfigIdentifierValues: null,
		};
		readOnlyNodePaths.set(snapshot.ast, null);
	}

	// Refresh recency without retaining an unbounded number of edited versions.
	snapshots.delete(input);
	snapshots.set(input, snapshot);
	if (snapshots.size > maximumSnapshots) {
		snapshots.delete(snapshots.keys().next().value!);
	}

	return snapshot;
};

// Undefined means this AST is mutable and callers must resolve a fresh path.
export const getReadOnlySourceNodePath = (
	ast: File,
	node: Node,
): recast.types.NodePath | null | undefined => {
	let paths = readOnlyNodePaths.get(ast);
	if (paths === undefined) return undefined;
	if (paths === null) {
		paths = new Map();
		const index = paths;
		recast.types.visit(ast, {
			visitNode(path) {
				index.set(path.node as Node, path);
				return this.traverse(path);
			},
		});
		readOnlyNodePaths.set(ast, paths);
	}

	return paths.get(node) ?? null;
};

// A mutating edit takes exclusive ownership. Never leave its AST available to a
// read of the old source, even when the edit throws after partially mutating it.
export const takeSourceSnapshotForEdit = (input: string): File => {
	const snapshot = snapshots.get(input);
	snapshots.delete(input);
	if (snapshot) readOnlyNodePaths.delete(snapshot.ast);
	return snapshot?.ast ?? parseAst(input);
};
