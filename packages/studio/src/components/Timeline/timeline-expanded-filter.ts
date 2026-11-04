import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineTreeNode} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import type {TimelineSelection} from './TimelineSelection';

export const filterTimelineExpandedTree = ({
	nodes,
	shouldShowNode,
}: {
	readonly nodes: readonly TimelineTreeNode[];
	readonly shouldShowNode: (node: TimelineTreeNode) => boolean;
}): TimelineTreeNode[] => {
	const out: TimelineTreeNode[] = [];

	for (const node of nodes) {
		if (node.kind === 'field') {
			if (shouldShowNode(node)) {
				out.push(node);
			}

			continue;
		}

		const children = filterTimelineExpandedTree({
			nodes: node.children,
			shouldShowNode,
		});

		if (children.length > 0 || shouldShowNode(node)) {
			out.push({
				...node,
				children,
			});
		}
	}

	return out;
};

const selectedExpandedKeysByItems = new WeakMap<
	readonly TimelineSelection[],
	{
		readonly rowKeys: ReadonlySet<string>;
		readonly sourceKeys: ReadonlySet<string>;
	}
>();

export const getSelectedTimelineExpandedKeys = (
	selectedItems: readonly TimelineSelection[],
) => {
	const cached = selectedExpandedKeysByItems.get(selectedItems);
	if (cached !== undefined) {
		return cached;
	}

	const rowKeys = new Set<string>();
	const sourceKeys = new Set<string>();
	selectedItems.forEach((item) => {
		if (item.type === 'guide') {
			return;
		}

		rowKeys.add(timelineNodePathInfoToKey(item.nodePathInfo));
		sourceKeys.add(
			stringifySequenceExpandedRowKey(
				item.nodePathInfo.sequenceSubscriptionKey,
			),
		);
	});

	// Timeline rows share immutable selection snapshots. Weak keys release old selections.
	const keys = {rowKeys, sourceKeys};
	selectedExpandedKeysByItems.set(selectedItems, keys);
	return keys;
};

export const getSelectedTimelineExpandedRowKeys = (
	selectedItems: readonly TimelineSelection[],
): ReadonlySet<string> =>
	getSelectedTimelineExpandedKeys(selectedItems).rowKeys;

export const isTimelineExpandedNodeSelected = ({
	nodePathInfo,
	selectedRowKeys,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly selectedRowKeys: ReadonlySet<string>;
}): boolean => selectedRowKeys.has(timelineNodePathInfoToKey(nodePathInfo));
