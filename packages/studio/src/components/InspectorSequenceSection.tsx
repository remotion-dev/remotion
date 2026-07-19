import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import type {CodePosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	SCHEMA_FIELD_GROUPS,
	flattenVisibleTreeNodes,
	type FlatTreeRow,
	type SchemaFieldGroupInfo,
	type TimelineTreeNode,
} from '../helpers/timeline-layout';
import {Plus} from '../icons/plus';
import {ModalsContext} from '../state/modals';
import {AssetInfo} from './CurrentAsset';
import {InlineAction} from './InlineAction';
import {
	sectionHeaderRow,
	sectionHeaderTitle,
	sequenceHeaderDivider,
} from './InspectorPanel/styles';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from './InspectorPanelLayout';
import {
	getTimelineAssetSrcFromSchema,
	getTimelineAssetLinkInfo,
	openTimelineAssetLink,
	splitRemoteSourceForMiddleEllipsis,
} from './Timeline/timeline-asset-link';
import {TimelineExpandedRow} from './Timeline/TimelineExpandedRow';
import {
	INSPECTOR_TIMELINE_ROW_LAYOUT,
	TimelineRowLayoutContext,
} from './Timeline/TimelineRowLayoutContext';
import {
	getTimelineSelectionFromNodePathInfo,
	TimelineSelectionOrderProvider,
	type TimelineSelection,
} from './Timeline/TimelineSelection';
import {useTimelineExpandedTree} from './Timeline/use-timeline-expanded-tree';
import {useSelectAsset} from './use-select-asset';

const container: React.CSSProperties = {
	color: WHITE,
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

const controlsEffectsDivider: React.CSSProperties = {
	...sequenceHeaderDivider,
	margin: '8px 0 4px',
};

const effectsHeaderTitle: React.CSSProperties = {
	...sectionHeaderTitle,
	flexShrink: 1,
};

const plusIcon: React.CSSProperties = {
	width: 15,
	height: 15,
};

const remoteSourceLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
	padding: `6px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
	whiteSpace: 'nowrap',
};

const remoteSourceLeading: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const remoteSourceTrailing: React.CSSProperties = {
	color: LIGHT_TEXT,
	flexShrink: 0,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	maxWidth: '55%',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
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

const INSPECTOR_COLLAPSED_ROWS_SESSION_STORAGE_KEY =
	'remotion.editor.inspectorCollapsedRows';

const getInspectorExpansionKey = (nodePathInfo: SequenceNodePathInfo) => {
	return JSON.stringify(nodePathInfo);
};

const loadInspectorCollapsedKeys = (): ReadonlySet<string> => {
	if (typeof window === 'undefined') {
		return new Set();
	}

	try {
		const raw = window.sessionStorage.getItem(
			INSPECTOR_COLLAPSED_ROWS_SESSION_STORAGE_KEY,
		);
		if (raw === null) {
			return new Set();
		}

		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return new Set();
		}

		return new Set(parsed.filter((key) => typeof key === 'string'));
	} catch {
		return new Set();
	}
};

const persistInspectorCollapsedKeys = (keys: ReadonlySet<string>): void => {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.sessionStorage.setItem(
			INSPECTOR_COLLAPSED_ROWS_SESSION_STORAGE_KEY,
			JSON.stringify([...keys]),
		);
	} catch {
		// Ignore quota errors or disabled storage.
	}
};

type SequenceWithControls = TSequence & {
	readonly controls: NonNullable<TSequence['controls']>;
};

type InspectorControlGroup = SchemaFieldGroupInfo & {
	readonly rows: FlatTreeRow[];
};

const getInspectorControlGroups = (
	rows: readonly FlatTreeRow[],
): InspectorControlGroup[] => {
	return SCHEMA_FIELD_GROUPS.map((group) => ({
		...group,
		rows: rows.filter(({node}) => {
			return node.kind === 'field' && node.field?.group === group.id;
		}),
	})).filter((group) => group.rows.length > 0);
};

export const getInspectorSelectableItems = (
	rows: readonly FlatTreeRow[],
): TimelineSelection[] => {
	return rows.flatMap(({node}): TimelineSelection[] => {
		const selection = getTimelineSelectionFromNodePathInfo(node.nodePathInfo);
		return selection ? [selection] : [];
	});
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
	readonly renderTransformControls: () => React.ReactNode;
}> = ({
	sequence,
	validatedLocation,
	nodePathInfo,
	keyframeDisplayOffset,
	renderSectionHeader,
	renderTransformControls,
}) => {
	const {tree} = useTimelineExpandedTree({
		sequence,
		nodePathInfo,
		includeTextContent: true,
		includeSourceControls: true,
	});
	const [collapsedKeys, setCollapsedKeys] = useState<ReadonlySet<string>>(
		loadInspectorCollapsedKeys,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(ModalsContext);
	const selectAsset = useSelectAsset();
	const mediaSrc = getTimelineAssetSrcFromSchema(sequence.controls);
	const assetLinkInfo = useMemo(
		() => (mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null),
		[mediaSrc],
	);
	const localAsset = assetLinkInfo?.kind === 'local' ? assetLinkInfo : null;
	const remoteAsset = assetLinkInfo?.kind === 'remote' ? assetLinkInfo : null;
	const remoteSourceParts = useMemo(
		() =>
			remoteAsset ? splitRemoteSourceForMiddleEllipsis(remoteAsset.href) : null,
		[remoteAsset],
	);
	const jumpToAsset = useCallback(() => {
		if (localAsset) {
			openTimelineAssetLink(localAsset, selectAsset);
		}
	}, [localAsset, selectAsset]);

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

			persistInspectorCollapsedKeys(next);
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

	const controlSelectableItems = useMemo(
		() =>
			getInspectorSelectableItems(
				controlRows.filter(
					({node}) => node.kind !== 'field' || node.field?.key !== 'src',
				),
			),
		[controlRows],
	);
	const effectSelectableItems = useMemo(
		() => getInspectorSelectableItems(effectRows),
		[effectRows],
	);
	const controlGroups = useMemo(
		() => getInspectorControlGroups(controlRows),
		[controlRows],
	);

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
			<TimelineRowLayoutContext.Provider
				key={JSON.stringify(node.nodePathInfo)}
				value={INSPECTOR_TIMELINE_ROW_LAYOUT}
			>
				<TimelineExpandedRow
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
			</TimelineRowLayoutContext.Provider>
		);
	};

	if (controlRows.length === 0 && !showEffectsSection) {
		return (
			<div style={container}>
				<div style={sequenceHeaderDivider} />
				<div style={emptyState}>No schema</div>
			</div>
		);
	}

	return (
		<div style={container}>
			<div style={sequenceHeaderDivider} />
			{controlRows.length > 0 ? (
				<TimelineSelectionOrderProvider items={controlSelectableItems}>
					{controlGroups.map((group, i) => (
						<React.Fragment key={group.id}>
							{i === 0 ? null : <div style={controlsEffectsDivider} />}
							{renderSectionHeader(group.label)}
							{group.id === 'source' && localAsset ? (
								<AssetInfo
									assetName={localAsset.assetPath}
									contentSized
									onAssetClick={jumpToAsset}
									readOnlyStudio
								/>
							) : null}
							{group.id === 'source' && remoteAsset && remoteSourceParts ? (
								<div style={remoteSourceLabel} title={remoteAsset.href}>
									<span style={remoteSourceLeading}>
										{remoteSourceParts.leading}
									</span>
									<span style={remoteSourceTrailing}>
										{remoteSourceParts.trailing}
									</span>
								</div>
							) : null}
							{group.id === 'transforms' ? renderTransformControls() : null}
							{group.id === 'source' ? null : group.rows.map(renderRow)}
						</React.Fragment>
					))}
				</TimelineSelectionOrderProvider>
			) : null}
			{showEffectsSection ? (
				<>
					{showControlsEffectsDivider ? (
						<div style={controlsEffectsDivider} />
					) : null}
					{renderEffectsHeader()}
					{effectRows.length > 0 ? (
						<TimelineSelectionOrderProvider items={effectSelectableItems}>
							{effectRows.map(renderRow)}
						</TimelineSelectionOrderProvider>
					) : null}
				</>
			) : null}
		</div>
	);
};
