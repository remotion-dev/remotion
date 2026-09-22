import type {File} from '@babel/types';
import {parseAst} from './sequence-props/parse-ast';
import type {VideoConfigIdentifierValues} from './sequence-props/video-config-values';

type SourceSnapshot = {
	ast: File;
	videoConfigIdentifierValues: Map<string, VideoConfigIdentifierValues>;
};

// Public reads share immutable source snapshots, including across the awaits in
// Studio's read/edit/write/status workflow. Content keys make external writes,
// caption edits, keyframe edits, and retained project versions independent.
const snapshots = new Map<string, SourceSnapshot>();
const maximumSnapshots = 8;

export const getReadOnlySourceSnapshot = (input: string): SourceSnapshot => {
	const snapshot = snapshots.get(input) ?? {
		ast: parseAst(input),
		videoConfigIdentifierValues: new Map<string, VideoConfigIdentifierValues>(),
	};
	// Refresh recency without retaining an unbounded number of edited versions.
	snapshots.delete(input);
	snapshots.set(input, snapshot);
	if (snapshots.size > maximumSnapshots) {
		snapshots.delete(snapshots.keys().next().value!);
	}

	return snapshot;
};

// A mutating edit takes exclusive ownership. Never leave its AST available to a
// read of the old source, even when the edit throws after partially mutating it.
export const takeSourceSnapshotForEdit = (input: string): File => {
	const snapshot = snapshots.get(input);
	snapshots.delete(input);
	return snapshot?.ast ?? parseAst(input);
};
