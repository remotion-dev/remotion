import type * as Codemods from '@remotion/codemods';
import type {
	CanUpdateSequencePropsResponseTrue,
	OverrideIdToNodePaths,
	PropStatuses,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {
	subscribeToPreviewServerConnectionState,
	subscribeToPreviewServerEvents,
} from '../../helpers/preview-server-events';

type CachedSource = {
	source: Promise<{
		contents: string;
		codemods: typeof Codemods;
	}>;
	constraints: Map<
		string,
		CanUpdateSequencePropsResponseTrue['durationDependentKeyframes']
	>;
};
const sourceCache = new Map<string, CachedSource>();
let subscribedToSourceChanges = false;

export const getKeyframeTrimConstraints = ({
	propStatuses,
	overrideIdsToNodePaths,
	sequences,
	affectedNodePaths,
}: {
	propStatuses: PropStatuses;
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	sequences: readonly TSequence[];
	affectedNodePaths: readonly SequencePropsSubscriptionKey[];
}): PropStatuses => {
	const affectedKeys = new Set(
		affectedNodePaths.map(Internals.makeSequencePropsSubscriptionKey),
	);
	const children = new Map<string, TSequence[]>();
	const pending: TSequence[] = [];
	for (const sequence of sequences) {
		const nodePath =
			sequence.controls && overrideIdsToNodePaths[sequence.controls.overrideId];
		if (
			nodePath &&
			affectedKeys.has(Internals.makeSequencePropsSubscriptionKey(nodePath))
		) {
			pending.push(sequence);
		}

		if (sequence.parent !== null) {
			const siblings = children.get(sequence.parent) ?? [];
			siblings.push(sequence);
			children.set(sequence.parent, siblings);
		}
	}

	const sources = new Map<string, SequencePropsSubscriptionKey>();
	const visited = new Set<string>();
	for (let index = 0; index < pending.length; index++) {
		const sequence = pending[index];
		if (visited.has(sequence.id)) continue;
		visited.add(sequence.id);
		pending.push(...(children.get(sequence.id) ?? []));
		const nodePath =
			sequence.controls && overrideIdsToNodePaths[sequence.controls.overrideId];
		if (!nodePath) continue;
		const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
		if (propStatuses[key]?.canUpdate) sources.set(key, nodePath);
	}

	if (sources.size === 0) return propStatuses;

	if (!subscribedToSourceChanges) {
		subscribedToSourceChanges = true;
		// Invalidation is cheap and never fetches or scans source. Watcher events
		// cover edits/undo; HMR also covers changed component/effect identities.
		subscribeToPreviewServerEvents((event) => {
			if (event.type === 'hmr' || event.type === 'init') {
				sourceCache.clear();
			} else if (event.type === 'sequence-node-paths-remapped') {
				for (const file of event.mutation.files)
					sourceCache.delete(file.absolutePath);
			} else if (event.type === 'sequence-props-updated') {
				sourceCache.delete(event.nodePath.absolutePath);
			} else if (event.type === 'lost-node-path') {
				// This event only carries a possibly relative source-map filename.
				sourceCache.clear();
			} else if (
				event.type === 'watched-file-deleted' ||
				event.type === 'watched-file-undeleted'
			) {
				sourceCache.delete(event.file);
			}
		});
		subscribeToPreviewServerConnectionState((state) => {
			if (state.type !== 'connected') sourceCache.clear();
		});
	}

	// Edits take a synchronous snapshot. Missing source and analysis load in the
	// background for the next edit, without changing an active gesture's bounds.
	const browserOperations = getBrowserStudioOperations();
	const result = {...propStatuses};
	for (const [key, source] of sources) {
		const fileName = source.absolutePath;
		let entry = sourceCache.get(fileName);
		if (!entry) {
			const pendingSource = (async () => {
				const [codemods, contents] = await Promise.all([
					import('@remotion/codemods'),
					(async () => {
						if (browserOperations) {
							const value = await browserOperations.getFileSource(fileName);
							if (value === null) throw new Error(`Could not load ${fileName}`);
							return value;
						}

						const response = await fetch(
							`/api/file-source?f=${encodeURIComponent(fileName)}`,
							{cache: 'no-store'},
						);
						if (!response.ok) throw new Error(`Could not load ${fileName}`);
						return response.text();
					})(),
				]);
				return {contents, codemods};
			})();
			entry = {source: pendingSource, constraints: new Map()};
			sourceCache.set(fileName, entry);
			const pendingEntry = entry;
			pendingSource.catch((error) => {
				if (sourceCache.get(fileName) !== pendingEntry) return;
				sourceCache.delete(fileName);
				Internals.Log.warn(
					{logLevel: 'info', tag: '@remotion/studio'},
					`Could not load ${fileName} for keyframe analysis. Using existing trim limits.`,
					error,
				);
			});
		}

		const cached = entry;
		const pathKey = JSON.stringify(source.nodePath);
		if (!cached.constraints.has(pathKey)) {
			// Also deduplicate pending analysis of the same node.
			cached.constraints.set(pathKey, null);
			cached.source.then(
				({contents, codemods}) => {
					if (sourceCache.get(fileName) !== cached) return;
					try {
						cached.constraints.set(
							pathKey,
							codemods.CodemodsInternals.getDurationDependentKeyframesFromContent(
								{
									fileContents: contents,
									nodePath: source.nodePath,
								},
							),
						);
					} catch (error) {
						Internals.Log.warn(
							{logLevel: 'info', tag: '@remotion/studio'},
							`Could not analyze keyframes in ${fileName}. Using existing trim limits.`,
							error,
						);
					}
				},
				() => {
					// The shared source failure is handled above; other files still work.
				},
			);
		}

		const status = propStatuses[key];
		const constraints = cached.constraints.get(pathKey);
		if (status?.canUpdate && constraints) {
			result[key] = {...status, durationDependentKeyframes: constraints};
		}
	}

	return result;
};
