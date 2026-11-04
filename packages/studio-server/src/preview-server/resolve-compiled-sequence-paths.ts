import {createHash} from 'node:crypto';
import {getNodes} from '@remotion/codemods';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {readSourceFile} from '../helpers/read-source-file';
import {resolveFileInsideProject} from '../helpers/resolve-file-inside-project';
import {getRedoStack, getUndoStack} from './undo-stack';

type Transition = {
	from: string;
	to: string;
	remappings: SequenceNodePathRemapping[] | null;
	reverse: boolean;
};

export const resolveCompiledSequencePaths = ({
	fileName,
	remotionRoot,
	fileContentsCache,
	targets,
}: {
	fileName: string;
	remotionRoot: string;
	fileContentsCache: Map<string, string>;
	targets: {index: number; hash: string; line: number; column: number}[];
}): Map<number, SequenceNodePath | null> => {
	const {absolutePath} = resolveFileInsideProject({
		remotionRoot,
		fileName,
		action: 'read',
	});
	const current = readSourceFile({absolutePath, fileContentsCache});
	const results = new Map<number, SequenceNodePath | null>();
	const hashes = new Map<string, string>();
	type Snapshot = {
		locations: Map<string, SequenceNodePath | null>;
		structure: string;
	};
	const snapshots = new Map<string, Snapshot | null>();
	const inspect = (contents: string) => {
		const cached = snapshots.get(contents);
		if (cached !== undefined) return cached;
		try {
			const nodes = getNodes({
				project: {rootDir: remotionRoot, files: {[absolutePath]: contents}},
				filePath: absolutePath,
			});
			const locations = new Map<string, SequenceNodePath | null>();
			for (const {nodePath, location} of nodes) {
				if (!location) continue;
				const key = `${location.line}:${location.column}`;
				locations.set(key, locations.has(key) ? null : nodePath);
			}

			const snapshot = {
				locations,
				structure: JSON.stringify(
					nodes.map((n) => [n.nodePath, n.tagName, n.componentIdentity]),
				),
			};
			snapshots.set(contents, snapshot);
			return snapshot;
		} catch {
			snapshots.set(contents, null);
			return null;
		}
	};

	const matchingTargets = new Map<string, typeof targets>();
	for (const target of targets) {
		const group = matchingTargets.get(target.hash) ?? [];
		group.push(target);
		matchingTargets.set(target.hash, group);
	}

	const acceptSnapshot = (
		contents: string,
		towardCurrent: readonly Transition[],
	) => {
		let hash = hashes.get(contents);
		if (!hash) {
			hash = createHash('sha256').update(contents).digest('hex');
			hashes.set(contents, hash);
		}

		const group = matchingTargets.get(hash);
		if (!group) return;
		const locations = inspect(contents)?.locations;
		const maps = towardCurrent.map((step) => {
			if (step.remappings === null) {
				// Props edits preserve JSX order, but pasted expressions can insert
				// hooks. Without an explicit mapping every JSX path must still match.
				const before = inspect(step.from);
				const after = inspect(step.to);
				return before !== null && before.structure === after?.structure
					? new Map<string, SequenceNodePath | null>()
					: null;
			}

			const paths = new Map<string, SequenceNodePath | null>();
			const destinations = new Set<string>();
			for (const {oldNodePath, newNodePath} of step.remappings) {
				const from = step.reverse ? newNodePath : oldNodePath;
				const to = step.reverse ? oldNodePath : newNodePath;
				if (to !== null) {
					const destination = JSON.stringify(to);
					if (destinations.has(destination)) return null;
					destinations.add(destination);
				}

				if (from === null) continue;
				const key = JSON.stringify(from);
				if (paths.has(key)) return null;
				paths.set(key, to);
			}

			// If a different node took a path, its former occupant cannot
			// have survived there, even if the remapping omitted that occupant.
			for (const key of destinations) {
				if (!paths.has(key)) paths.set(key, null);
			}

			return paths;
		});
		for (const target of group) {
			let nodePath: SequenceNodePath | null =
				locations?.get(`${target.line}:${target.column}`) ?? null;
			for (let i = maps.length - 1; nodePath !== null && i >= 0; i--) {
				const map = maps[i];
				if (map === null) {
					nodePath = null;
					break;
				}

				const moved = map.get(JSON.stringify(nodePath));
				if (moved !== undefined) nodePath = moved;
			}

			// An identical source can occur on both sides of Undo. If those
			// histories disagree, that hash cannot identify the live element.
			const previous = results.get(target.index);
			results.set(
				target.index,
				previous === undefined ||
					JSON.stringify(previous) === JSON.stringify(nodePath)
					? nodePath
					: null,
			);
		}
	};

	acceptSnapshot(current, []);
	for (const [entries, reverse] of [
		[getUndoStack(), false],
		[getRedoStack(), true],
	] as const) {
		let contents = current;
		const changes: Transition[] = [];
		for (let i = entries.length - 1; i >= 0; i--) {
			const entry = entries[i];
			const snapshot = entry.snapshots.find((s) => s.filePath === absolutePath);
			if (!snapshot) continue;
			const from = reverse ? snapshot.newContents : snapshot.oldContents;
			const to = reverse ? snapshot.oldContents : snapshot.newContents;
			if (
				from === null ||
				to !== contents ||
				(snapshot.nodePathRemappings === null &&
					entry.entryType !== 'sequence-props' &&
					entry.entryType !== 'effect-props')
			)
				break;
			changes.push({
				from,
				to,
				reverse,
				remappings: snapshot.nodePathRemappings,
			});
			acceptSnapshot(from, changes);
			contents = from;
		}
	}

	return results;
};
