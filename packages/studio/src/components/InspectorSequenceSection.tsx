import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import type {CodePosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT, LINE_COLOR} from '../helpers/colors';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	flattenVisibleTreeNodes,
	type FlatTreeRow,
	type TimelineTreeNode,
} from '../helpers/timeline-layout';
import {Plus} from '../icons/plus';
import {ModalsContext} from '../state/modals';
import {InlineAction} from './InlineAction';
import {sectionHeaderRow} from './InspectorPanel/styles';
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
	lineHeight: 1.4,
	padding: '0 12px 8px',
};

const divider: React.CSSProperties = {
	backgroundColor: LINE_COLOR,
	flexShrink: 0,
	height: 1,
	margin: '4px 0',
};

const controlsEffectsDivider: React.CSSProperties = {
	...divider,
	margin: '8px 0 4px',
};

const effectsHeaderTitle: React.CSSProperties = {
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const plusIcon: React.CSSProperties = {
	width: 10,
	height: 10,
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

type SequenceWithControls = TSequence & {
	readonly controls: NonNullable<TSequence['controls']>;
};

export const hasSequenceControls = (
	sequence: TSequence,
): sequence is SequenceWithControls => {
	return sequence.controls !== null;
};

export const InspectorSequenceSection: React.FC<{
	readonly sequence: SequenceWithControls;
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
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(ModalsContext);

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

	const {schema} = sequence.controls;
	const showEffectsSection =
		nodePathInfo.supportsEffects || effectRows.length > 0;
	const showControlsEffectsDivider =
		controlRows.length > 0 && showEffectsSection;
	const canAddEffect =
		nodePathInfo.supportsEffects &&
		previewServerState.type === 'connected' &&
		Boolean(validatedLocation.source);

	const onAddEffect = useCallback(() => {
		if (!canAddEffect || previewServerState.type !== 'connected') {
			return;
		}

		setSelectedModal({
			type: 'add-effect',
			clientId: previewServerState.clientId,
			fileName: validatedLocation.source,
			nodePath: nodePathInfo.sequenceSubscriptionKey,
		});
	}, [
		canAddEffect,
		nodePathInfo.sequenceSubscriptionKey,
		previewServerState,
		setSelectedModal,
		validatedLocation.source,
	]);

	const renderEffectsHeader = () => {
		return renderSectionHeader(
			<div style={sectionHeaderRow}>
				<div style={effectsHeaderTitle}>Effects</div>
				<InlineAction
					disabled={!canAddEffect}
					onClick={onAddEffect}
					title={canAddEffect ? 'Add effect' : undefined}
					renderAction={(color) => <Plus color={color} style={plusIcon} />}
				/>
			</div>,
		);
	};

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
				keyframeControlsMode="inspector"
			/>
		);
	};

	if (controlRows.length === 0 && !showEffectsSection) {
		return (
			<div style={container}>
				<div style={divider} />
				<div style={emptyState}>No schema</div>
			</div>
		);
	}

	return (
		<div style={container}>
			<div style={divider} />
			{controlRows.length > 0 ? renderSectionHeader('Controls') : null}
			{controlRows.map(renderRow)}
			{showEffectsSection ? (
				<>
					{showControlsEffectsDivider ? (
						<div style={controlsEffectsDivider} />
					) : null}
					{renderEffectsHeader()}
					{effectRows.length === 0 ? (
						<div style={emptyState}>None</div>
					) : (
						effectRows.map(renderRow)
					)}
				</>
			) : null}
		</div>
	);
};
