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
	contents: string;
	constraints: Map<
		string,
		CanUpdateSequencePropsResponseTrue['durationDependentKeyframes']
	>;
};
const sourceCache = new Map<string, Promise<CachedSource>>();
let subscribedToSourceChanges = false;

export const loadKeyframeTrimConstraints = async ({
	propStatuses,
	overrideIdsToNodePaths,
	sequences,
	affectedNodePaths,
}: {
	propStatuses: PropStatuses;
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	sequences: readonly TSequence[];
	affectedNodePaths: readonly SequencePropsSubscriptionKey[];
}): Promise<PropStatuses> => {
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

	// Only affected clips and descendants need source analysis. Concurrent
	// gestures/inspector fields share in-flight reads as well as parsed results.
	const browserOperations = getBrowserStudioOperations();
	const [codemods, files] = await Promise.all([
		import('@remotion/codemods').catch((error) => {
			Internals.Log.warn(
				{logLevel: 'info', tag: '@remotion/studio'},
				'Could not load keyframe analysis. Using existing trim limits.',
				error,
			);
			return null;
		}),
		Promise.all(
			[
				...new Set([...sources.values()].map((source) => source.absolutePath)),
			].map(async (fileName) => {
				// Retry once if a source edit invalidates an in-flight read. If it
				// keeps changing, this gesture can still use the existing limits.
				for (let attempt = 0; attempt < 2; attempt++) {
					let entry = sourceCache.get(fileName);
					if (!entry) {
						entry = (async (): Promise<CachedSource> => {
							let contents: string;
							if (browserOperations) {
								const value = await browserOperations.getFileSource(fileName);
								if (value === null)
									throw new Error(`Could not load ${fileName}`);
								contents = value;
							} else {
								const response = await fetch(
									`/api/file-source?f=${encodeURIComponent(fileName)}`,
									{cache: 'no-store'},
								);
								if (!response.ok) throw new Error(`Could not load ${fileName}`);
								contents = await response.text();
							}

							return {contents, constraints: new Map()};
						})();
						sourceCache.set(fileName, entry);
					}

					try {
						const cached = await entry;
						if (sourceCache.get(fileName) !== entry) continue;
						return [fileName, {entry, cached}] as const;
					} catch (error) {
						if (sourceCache.get(fileName) === entry)
							sourceCache.delete(fileName);
						Internals.Log.warn(
							{logLevel: 'info', tag: '@remotion/studio'},
							`Could not read ${fileName} for keyframe analysis. Using existing trim limits.`,
							error,
						);
						return null;
					}
				}

				return null;
			}),
		),
	]);
	if (!codemods) return propStatuses;

	const contentsByFile = new Map(files.filter((file) => file !== null));
	const result = {...propStatuses};
	for (const [key, source] of sources) {
		const status = propStatuses[key];
		if (!status?.canUpdate) continue;
		const file = contentsByFile.get(source.absolutePath);
		if (!file || sourceCache.get(source.absolutePath) !== file.entry) continue;
		const {cached} = file;
		const pathKey = JSON.stringify(source.nodePath);
		try {
			if (!cached.constraints.has(pathKey)) {
				cached.constraints.set(
					pathKey,
					codemods.CodemodsInternals.getDurationDependentKeyframesFromContent({
						fileContents: cached.contents,
						nodePath: source.nodePath,
					}),
				);
			}
		} catch (error) {
			Internals.Log.warn(
				{logLevel: 'info', tag: '@remotion/studio'},
				`Could not analyze keyframes in ${source.absolutePath}. Using existing trim limits.`,
				error,
			);
			continue;
		}

		result[key] = {
			...status,
			durationDependentKeyframes: cached.constraints.get(pathKey)!,
		};
	}

	return result;
};
