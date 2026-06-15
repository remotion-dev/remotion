import React, {useCallback, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import type {CodePosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {LIGHT_TEXT} from '../helpers/colors';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	flattenVisibleTreeNodes,
	type FlatTreeRow,
	type TimelineTreeNode,
} from '../helpers/timeline-layout';
import {TimelineExpandedRow} from './Timeline/TimelineExpandedRow';
import {useTimelineExpandedTree} from './Timeline/use-timeline-expanded-tree';

const container: React.CSSProperties = {
	color: 'white',
	display: 'flex',
	flexDirection: 'column',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
};

const emptyState: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	padding: '0 12px 8px',
};

const isEffectsRoot = (
	node: TimelineTreeNode,
): node is Extract<TimelineTreeNode, {kind: 'group'}> => {
	if (node.kind !== 'group' || node.effectInfo !== null) {
		return false;
	}

	const {auxiliaryKeys} = node.nodePathInfo;
	return auxiliaryKeys[auxiliaryKeys.length - 1] === 'effects';
};

const getInspectorExpansionKey = (nodePathInfo: SequenceNodePathInfo) => {
	return JSON.stringify(nodePathInfo);
};

export const InspectorSequenceSection: React.FC<{
	readonly sequence: TSequence;
	readonly validatedLocation: CodePosition;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
	readonly renderSectionHeader: (children: React.ReactNode) => React.ReactNode;
}> = ({
	sequence,
	validatedLocation,
	nodePathInfo,
	keyframeDisplayOffset,
	renderSectionHeader,
}) => {
	const {tree} = useTimelineExpandedTree({
		sequence,
		nodePathInfo,
	});
	const [collapsedKeys, setCollapsedKeys] = useState<ReadonlySet<string>>(
		() => new Set(),
	);

	const getIsExpanded = useCallback(
		(candidate: SequenceNodePathInfo) => {
			return !collapsedKeys.has(getInspectorExpansionKey(candidate));
		},
		[collapsedKeys],
	);

	const toggleTrack = useCallback((candidate: SequenceNodePathInfo) => {
		setCollapsedKeys((prev) => {
			const key = getInspectorExpansionKey(candidate);
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}

			return next;
		});
	}, []);

	const {controlRows, effectRows} = useMemo(() => {
		const controlNodes: TimelineTreeNode[] = [];
		let effectsRoot: TimelineTreeNode | null = null;

		for (const node of tree) {
			if (isEffectsRoot(node)) {
				effectsRoot = node;
			} else {
				controlNodes.push(node);
			}
		}

		return {
			controlRows: flattenVisibleTreeNodes({
				nodes: controlNodes,
				getIsExpanded,
			}),
			effectRows:
				effectsRoot === null
					? []
					: flattenVisibleTreeNodes({
							nodes: effectsRoot.children,
							getIsExpanded,
						}),
		};
	}, [getIsExpanded, tree]);

	const {schema} = sequence.controls!;

	const renderRow = ({node, depth}: FlatTreeRow) => {
		return (
			<TimelineExpandedRow
				key={JSON.stringify(node.nodePathInfo)}
				node={node}
				depth={depth}
				nestedDepth={0}
				rowDepthBase={0}
				getIsExpanded={getIsExpanded}
				toggleTrack={toggleTrack}
				validatedLocation={validatedLocation}
				nodePath={nodePathInfo.sequenceSubscriptionKey}
				schema={schema}
				keyframeDisplayOffset={keyframeDisplayOffset}
			/>
		);
	};

	if (controlRows.length === 0 && effectRows.length === 0) {
		return <div style={emptyState}>No schema</div>;
	}

	return (
		<div style={container}>
			{controlRows.map(renderRow)}
			{effectRows.length > 0 ? renderSectionHeader('Effects') : null}
			{effectRows.map(renderRow)}
		</div>
	);
};
