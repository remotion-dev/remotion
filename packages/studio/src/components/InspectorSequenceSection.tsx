import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {CodePosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	flattenVisibleTreeNodes,
	SCHEMA_FIELD_GROUPS,
	type FlatTreeRow,
	type SchemaFieldGroupInfo,
	type TimelineTreeNode,
} from '../helpers/timeline-layout';
import {Plus} from '../icons/plus';
import {ModalsContext} from '../state/modals';
import {AssetFileIcon} from './AssetFileIcon';
import {InlineAction} from './InlineAction';
import {InspectorInlineAction, InspectorSection} from './InspectorPanel/common';
import {sectionHeaderRow, sectionHeaderTitle} from './InspectorPanel/styles';
import {getAssetSearchQueryForComponent} from './QuickSwitcher/asset-search';
import {
	BORDER_RADIUS_SHORTHAND_KEY,
	getBorderRadiusConversion,
	getBorderRadiusConversionChanges,
} from './Timeline/border-radius-representation';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {
	getTimelineAssetLinkInfo,
	getTimelineAssetSrcFromSchema,
	openTimelineAssetLink,
	splitRemoteSourceForMiddleEllipsis,
} from './Timeline/timeline-asset-link';
import {
	AssetSelectionContext,
	type InspectorSourceAction,
} from './Timeline/TimelineAssetField';
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
	padding: '0 12px',
};

const effectsHeaderTitle: React.CSSProperties = {
	...sectionHeaderTitle,
	flexShrink: 1,
};

const plusIcon: React.CSSProperties = {
	width: 15,
	height: 15,
};

const assetSelectorIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 18,
	width: 18,
};

const remoteSourcePartsContainer: React.CSSProperties = {
	color: 'inherit',
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
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
	readonly renderTransformControls: () => React.ReactNode;
}> = ({
	sequence,
	validatedLocation,
	nodePathInfo,
	keyframeDisplayOffset,
	renderTransformControls,
}) => {
	const {tree, propStatuses} = useTimelineExpandedTree({
		sequence,
		nodePathInfo,
		includeTextContent: true,
		includeSourceControls: true,
	});
	const [collapsedKeys, setCollapsedKeys] = useState<ReadonlySet<string>>(
		loadInspectorCollapsedKeys,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {setSelectedModal} = useContext(ModalsContext);
	const selectAsset = useSelectAsset();
	const mediaSrc = getTimelineAssetSrcFromSchema(sequence.controls);
	const assetSelectionInitialQuery = getAssetSearchQueryForComponent(
		sequence.controls.componentIdentity,
	);
	const getSourceAction = useCallback(
		(src: string): InspectorSourceAction | null => {
			const linkInfo = getTimelineAssetLinkInfo(src);
			if (linkInfo?.kind === 'local') {
				const fileName =
					linkInfo.assetPath.split('/').pop() ?? linkInfo.assetPath;

				return {
					children: fileName,
					disabled: false,
					onClick: () => openTimelineAssetLink(linkInfo, selectAsset),
					renderIcon: (color: string) => (
						<AssetFileIcon
							color={color}
							fileType={getPreviewFileType(linkInfo.assetPath)}
							style={assetSelectorIcon}
						/>
					),
					title: linkInfo.assetPath,
				};
			}

			if (linkInfo?.kind === 'remote') {
				const parts = splitRemoteSourceForMiddleEllipsis(linkInfo.href);

				return {
					children: (
						<span style={remoteSourcePartsContainer}>
							<span style={remoteSourceLeading}>{parts.leading}</span>
							<span style={remoteSourceTrailing}>{parts.trailing}</span>
						</span>
					),
					disabled: false,
					onClick: null,
					title: linkInfo.href,
				};
			}

			return null;
		},
		[selectAsset],
	);
	const sourceAction = useMemo(() => {
		return mediaSrc ? getSourceAction(mediaSrc) : null;
	}, [getSourceAction, mediaSrc]);
	const assetSelectionContextValue = useMemo(
		() => ({
			getSourceAction,
			initialQuery: assetSelectionInitialQuery,
			sourceAction,
		}),
		[assetSelectionInitialQuery, getSourceAction, sourceAction],
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
	const layoutGroup = controlGroups.find((group) => group.id === 'layout');
	const controlGroupsWithoutLayout = controlGroups.filter(
		(group) => group.id !== 'layout',
	);

	const {schema} = sequence.controls;
	const borderRadiusGroup = controlGroups.find(
		(group) => group.id === 'border-radius',
	);
	const borderRadiusUsesShorthand = borderRadiusGroup?.rows.some(
		({node}) =>
			node.kind === 'field' && node.field?.key === BORDER_RADIUS_SHORTHAND_KEY,
	);
	const borderRadiusConversion = getBorderRadiusConversion(
		Internals.getPropStatusesCtx(
			propStatuses,
			nodePathInfo.sequenceSubscriptionKey,
		),
	);
	const showEffectsSection =
		nodePathInfo.supportsEffects || effectRows.length > 0;
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

	const onConvertBorderRadius = useCallback(() => {
		if (
			borderRadiusConversion === null ||
			previewServerState.type !== 'connected'
		) {
			return;
		}

		const common = {
			fileName: validatedLocation.source,
			nodePath: nodePathInfo.sequenceSubscriptionKey,
			defaultValue: null,
			schema,
		};
		const changes = getBorderRadiusConversionChanges(
			borderRadiusConversion,
		).map((change) => ({...common, ...change}));

		saveSequenceProps({
			changes,
			addedKeyframes: null,
			movedKeyframes: null,
			setPropStatuses,
			clientId: previewServerState.clientId,
			undoLabel: 'Change border radius representation',
			redoLabel: 'Change border radius representation again',
		});
	}, [
		borderRadiusConversion,
		nodePathInfo.sequenceSubscriptionKey,
		previewServerState,
		schema,
		setPropStatuses,
		validatedLocation.source,
	]);

	const borderRadiusConversionControl = borderRadiusGroup ? (
		<InspectorInlineAction
			disabled={
				borderRadiusConversion === null ||
				previewServerState.type !== 'connected'
			}
			onClick={onConvertBorderRadius}
			size="compact"
			title={
				borderRadiusConversion === null
					? borderRadiusUsesShorthand
						? 'A static border radius is required to use individual corners'
						: 'All four corners must have the same static value'
					: undefined
			}
		>
			{borderRadiusUsesShorthand ? 'Individual corners' : 'Use one value'}
		</InspectorInlineAction>
	) : null;

	const effectsHeader = (
		<div style={sectionHeaderRow}>
			<div style={effectsHeaderTitle}>Effects</div>
			<InlineAction
				disabled={!canAddEffect}
				onClick={onAddEffect}
				title={canAddEffect ? 'Add effect' : undefined}
				renderAction={(color) => <Plus color={color} style={plusIcon} />}
			/>
		</div>
	);

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
				<InspectorSection header="Controls">
					<div style={emptyState}>No schema</div>
				</InspectorSection>
			</div>
		);
	}

	return (
		<AssetSelectionContext.Provider value={assetSelectionContextValue}>
			<div style={container}>
				{controlRows.length > 0 ? (
					<TimelineSelectionOrderProvider items={controlSelectableItems}>
						{controlGroupsWithoutLayout.map((group) => (
							<InspectorSection key={group.id} header={group.label}>
								{group.id === 'transforms' ? renderTransformControls() : null}
								{group.id === 'border-radius'
									? borderRadiusConversionControl
									: null}
								{group.rows.map(renderRow)}
							</InspectorSection>
						))}
					</TimelineSelectionOrderProvider>
				) : null}
				{showEffectsSection ? (
					<InspectorSection header={effectsHeader}>
						{effectRows.length > 0 ? (
							<TimelineSelectionOrderProvider items={effectSelectableItems}>
								{effectRows.map(renderRow)}
							</TimelineSelectionOrderProvider>
						) : null}
					</InspectorSection>
				) : null}
				{layoutGroup ? (
					<TimelineSelectionOrderProvider items={controlSelectableItems}>
						<InspectorSection header={layoutGroup.label}>
							{layoutGroup.rows.map(renderRow)}
						</InspectorSection>
					</TimelineSelectionOrderProvider>
				) : null}
			</div>
		</AssetSelectionContext.Provider>
	);
};
