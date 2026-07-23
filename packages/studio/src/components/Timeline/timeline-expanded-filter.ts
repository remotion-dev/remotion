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

export const getSelectedTimelineExpandedRowKeys = (
	selectedItems: readonly TimelineSelection[],
): ReadonlySet<string> => {
	return new Set(
		selectedItems.flatMap((item): string[] => {
			if (item.type === 'guide') {
				return [];
			}

			return [timelineNodePathInfoToKey(item.nodePathInfo)];
		}),
	);
};

export const isTimelineExpandedNodeSelected = ({
	nodePathInfo,
	selectedRowKeys,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly selectedRowKeys: ReadonlySet<string>;
}): boolean => selectedRowKeys.has(timelineNodePathInfoToKey(nodePathInfo));
