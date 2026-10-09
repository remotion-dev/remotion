import type {
	OverrideIdToNodePaths,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import type {CanvasSelectionItem, CanvasSelectionSnapshot} from './selection';

/**
 * How a source edit moved a JSX node, as returned by the mutations of
 * `@remotion/codemods` in `nodePathRemappings`. A `null` old path is an
 * insertion, a `null` new path a removal.
 */
export type CanvasSequenceNodePathRemapping = {
	/** The edited file, matching `absolutePath` of the registered node paths. */
	readonly filePath: string;
	readonly oldNodePath: SequenceNodePath | null;
	readonly newNodePath: SequenceNodePath | null;
};

const findRemapping = (
	key: SequencePropsSubscriptionKey,
	remappings: readonly CanvasSequenceNodePathRemapping[],
) => {
	const nodePath = JSON.stringify(key.nodePath);
	return (
		remappings.find(
			(remapping) =>
				remapping.filePath === key.absolutePath &&
				remapping.oldNodePath !== null &&
				JSON.stringify(remapping.oldNodePath) === nodePath,
		) ?? null
	);
};

/**
 * The source node a selection follows after the edit. `null` when the node
 * was removed, the same object when the node was not remapped.
 */
export const remapSequenceNodePathInfo = (
	nodePathInfo: SequenceNodePathInfo,
	remappings: readonly CanvasSequenceNodePathRemapping[],
): SequenceNodePathInfo | null => {
	const remapping = findRemapping(
		nodePathInfo.sequenceSubscriptionKey,
		remappings,
	);
	if (
		remapping === null ||
		JSON.stringify(remapping.newNodePath) ===
			JSON.stringify(nodePathInfo.sequenceSubscriptionKey.nodePath)
	) {
		return nodePathInfo;
	}

	if (remapping.newNodePath === null) {
		return null;
	}

	return {
		...nodePathInfo,
		sequenceSubscriptionKey: {
			...nodePathInfo.sequenceSubscriptionKey,
			nodePath: remapping.newNodePath,
		},
	};
};

/**
 * Override IDs belong to mounted React instances. Fast Refresh reuses an
 * instance at a path that still exists after the edit, so its ID then refers
 * to whichever node is at that path. Only IDs whose path disappeared follow
 * their node to its new path, or are dropped when the node was removed.
 */
export const remapOverrideIdToNodePaths = (
	nodePaths: OverrideIdToNodePaths,
	remappings: readonly CanvasSequenceNodePathRemapping[],
): OverrideIdToNodePaths | null => {
	let changed = false;
	const next: OverrideIdToNodePaths = {};
	for (const [overrideId, key] of Object.entries(nodePaths)) {
		const remapping = findRemapping(key, remappings);
		const nodePath = JSON.stringify(key.nodePath);
		const pathStillExists = remappings.some(
			(candidate) =>
				candidate.filePath === key.absolutePath &&
				candidate.newNodePath !== null &&
				JSON.stringify(candidate.newNodePath) === nodePath,
		);
		if (remapping === null || pathStillExists) {
			next[overrideId] = key;
			continue;
		}

		changed = true;
		if (remapping.newNodePath !== null) {
			next[overrideId] = {...key, nodePath: remapping.newNodePath};
		}
	}

	return changed ? next : null;
};

const remapSelectionItem = (
	item: CanvasSelectionItem,
	remappings: readonly CanvasSequenceNodePathRemapping[],
): CanvasSelectionItem | null => {
	if (item.type === 'guide') {
		return item;
	}

	const nodePathInfo = remapSequenceNodePathInfo(item.nodePathInfo, remappings);
	if (nodePathInfo === item.nodePathInfo) {
		return item;
	}

	return nodePathInfo === null ? null : {...item, nodePathInfo};
};

/** The selection after the edit, or `null` when no item was affected. */
export const remapCanvasSelection = (
	snapshot: CanvasSelectionSnapshot,
	remappings: readonly CanvasSequenceNodePathRemapping[],
): CanvasSelectionSnapshot | null => {
	const selectedItems = snapshot.selectedItems
		.map((item) => remapSelectionItem(item, remappings))
		.filter((item): item is CanvasSelectionItem => item !== null);
	const anchor =
		snapshot.anchor === null
			? null
			: remapSelectionItem(snapshot.anchor, remappings);
	if (
		selectedItems.length === snapshot.selectedItems.length &&
		selectedItems.every(
			(item, index) => item === snapshot.selectedItems[index],
		) &&
		anchor === snapshot.anchor
	) {
		return null;
	}

	return {selectedItems, anchor};
};
