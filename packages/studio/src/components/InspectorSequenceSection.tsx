import type {Caption} from '@remotion/captions';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {CodePosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../helpers/interactivity-enabled';
import {
	flattenVisibleTreeNodes,
	SCHEMA_FIELD_GROUPS,
	type FlatTreeRow,
	type SchemaFieldGroupInfo,
	type TimelineTreeNode,
} from '../helpers/timeline-layout';
import {BorderRadiusIcon} from '../icons/border-radius';
import {FullscreenIcon} from '../icons/fullscreen';
import {Plus} from '../icons/plus';
import {SetSelectedModalContext} from '../state/modals';
import {AssetFileIcon} from './AssetFileIcon';
import {InlineAction} from './InlineAction';
import {InlineCaptionInspector} from './InlineCaptionInspector';
import {InspectorSection} from './InspectorPanel/common';
import {
	getInspectorSectionActivity,
	isSmartCollapsibleInspectorGroup,
} from './InspectorPanel/inspector-section-collapse';
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

const borderRadiusToggleIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 15,
	width: 15,
};

const collapsibleSectionHeaderButton: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: 'transparent',
	border: 'none',
	borderRadius: 3,
	cursor: 'default',
	display: 'block',
	flex: 1,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	fontWeight: 'bold',
	lineHeight: '16px',
	margin: 0,
	minWidth: 0,
	overflow: 'hidden',
	padding: '4px 0',
	textAlign: 'left',
	textOverflow: 'ellipsis',
	userSelect: 'none',
	whiteSpace: 'nowrap',
};

const CollapsibleInspectorSectionHeader: React.FC<{
	readonly action: React.ReactNode;
	readonly expanded: boolean;
	readonly label: string;
	readonly onToggle: () => void;
}> = ({action, expanded, label, onToggle}) => {
	const [hovered, setHovered] = useState(false);
	const style = useMemo<React.CSSProperties>(() => {
		return {
			...collapsibleSectionHeaderButton,
			color: hovered ? WHITE : LIGHT_TEXT,
		};
	}, [hovered]);

	return (
		<div style={sectionHeaderRow}>
			<button
				type="button"
				aria-expanded={expanded}
				aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
				className="__remotion-inspector-section-title"
				onClick={onToggle}
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => setHovered(false)}
				style={style}
			>
				{label}
			</button>
			{action}
		</div>
	);
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
const INSPECTOR_SECTION_EXPANSION_OVERRIDES_SESSION_STORAGE_KEY =
	'remotion.editor.inspectorSectionExpansionOverrides';

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

type InspectorSectionExpansionOverrides = Readonly<Record<string, boolean>>;

const loadInspectorSectionExpansionOverrides =
	(): InspectorSectionExpansionOverrides => {
		if (typeof window === 'undefined') {
			return {};
		}

		try {
			const raw = window.sessionStorage.getItem(
				INSPECTOR_SECTION_EXPANSION_OVERRIDES_SESSION_STORAGE_KEY,
			);
			if (raw === null) {
				return {};
			}

			const parsed: unknown = JSON.parse(raw);
			if (
				parsed === null ||
				typeof parsed !== 'object' ||
				Array.isArray(parsed)
			) {
				return {};
			}

			return Object.fromEntries(
				Object.entries(parsed).filter((entry): entry is [string, boolean] => {
					return typeof entry[1] === 'boolean';
				}),
			);
		} catch {
			return {};
		}
	};

const persistInspectorSectionExpansionOverrides = (
	overrides: InspectorSectionExpansionOverrides,
): void => {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.sessionStorage.setItem(
			INSPECTOR_SECTION_EXPANSION_OVERRIDES_SESSION_STORAGE_KEY,
			JSON.stringify(overrides),
		);
	} catch {
		// Ignore quota errors or disabled storage.
	}
};

const getInspectorSectionExpansionKey = ({
	nodePathInfo,
	groupId,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly groupId: SchemaFieldGroupInfo['id'];
}) => {
	return JSON.stringify([
		nodePathInfo.sequenceSubscriptionKey.absolutePath,
		nodePathInfo.sequenceSubscriptionKey.nodePath,
		nodePathInfo.index,
		groupId,
	]);
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
	readonly readOnlyStudio: boolean;
	readonly validatedLocation: CodePosition;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
	readonly renderTransformControls: () => React.ReactNode;
}> = ({
	sequence,
	readOnlyStudio,
	validatedLocation,
	nodePathInfo,
	keyframeDisplayOffset,
	renderTransformControls,
}) => {
	const {tree, propStatuses, runtimeValues} = useTimelineExpandedTree({
		sequence,
		nodePathInfo,
		includeTextContent: true,
		includeSourceControls: true,
	});
	const [collapsedKeys, setCollapsedKeys] = useState<ReadonlySet<string>>(
		loadInspectorCollapsedKeys,
	);
	const [sectionExpansionOverrides, setSectionExpansionOverrides] = useState(
		loadInspectorSectionExpansionOverrides,
	);
	const [automaticSectionExpansion, setAutomaticSectionExpansion] = useState<
		Readonly<Record<string, boolean>>
	>({});
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const selectAsset = useSelectAsset();
	const mediaSrc = getTimelineAssetSrcFromSchema(
		sequence.controls,
		runtimeValues,
	);
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
					onClick: () => openTimelineAssetLink(linkInfo, selectAsset),
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
	const sequencePropStatuses = Internals.getPropStatusesCtx(
		propStatuses,
		nodePathInfo.sequenceSubscriptionKey,
	);
	const {schema} = sequence.controls;
	const getControlGroupActivity = useCallback(
		(group: InspectorControlGroup) => {
			if (!isSmartCollapsibleInspectorGroup(group.id)) {
				return 'active' as const;
			}

			return getInspectorSectionActivity({
				group: group.id,
				propStatuses: sequencePropStatuses,
				schema,
			});
		},
		[schema, sequencePropStatuses],
	);
	useEffect(() => {
		setAutomaticSectionExpansion((previous) => {
			let changed = false;
			const next = {...previous};
			for (const group of controlGroups) {
				if (!isSmartCollapsibleInspectorGroup(group.id)) {
					continue;
				}

				const expansionKey = getInspectorSectionExpansionKey({
					nodePathInfo,
					groupId: group.id,
				});
				const activity = getControlGroupActivity(group);
				if (activity === 'active' && next[expansionKey] !== true) {
					next[expansionKey] = true;
					changed = true;
				} else if (
					activity === 'inactive' &&
					next[expansionKey] === undefined
				) {
					next[expansionKey] = false;
					changed = true;
				}
			}

			return changed ? next : previous;
		});
	}, [controlGroups, getControlGroupActivity, nodePathInfo]);
	const isControlGroupExpanded = useCallback(
		(group: InspectorControlGroup): boolean => {
			if (!isSmartCollapsibleInspectorGroup(group.id)) {
				return true;
			}

			const expansionKey = getInspectorSectionExpansionKey({
				nodePathInfo,
				groupId: group.id,
			});
			const override = sectionExpansionOverrides[expansionKey];
			if (override !== undefined) {
				return override;
			}

			const automaticExpansion = automaticSectionExpansion[expansionKey];
			if (automaticExpansion !== undefined) {
				return automaticExpansion;
			}

			return getControlGroupActivity(group) !== 'inactive';
		},
		[
			automaticSectionExpansion,
			getControlGroupActivity,
			nodePathInfo,
			sectionExpansionOverrides,
		],
	);
	const toggleControlGroup = useCallback(
		(group: InspectorControlGroup) => {
			const expansionKey = getInspectorSectionExpansionKey({
				nodePathInfo,
				groupId: group.id,
			});
			const nextExpanded = !isControlGroupExpanded(group);
			setSectionExpansionOverrides((previous) => {
				const next = {...previous, [expansionKey]: nextExpanded};
				persistInspectorSectionExpansionOverrides(next);
				return next;
			});
		},
		[isControlGroupExpanded, nodePathInfo],
	);
	const visibleControlRows = controlGroups.flatMap((group) => {
		return isControlGroupExpanded(group) ? group.rows : [];
	});
	const controlSelectableItems = useMemo(
		() =>
			getInspectorSelectableItems(
				visibleControlRows.filter(
					({node}) => node.kind !== 'field' || node.field?.key !== 'src',
				),
			),
		[visibleControlRows],
	);

	const borderRadiusGroup = controlGroups.find(
		(group) => group.id === 'border-radius',
	);
	const borderRadiusUsesShorthand = borderRadiusGroup?.rows.some(
		({node}) =>
			node.kind === 'field' && node.field?.key === BORDER_RADIUS_SHORTHAND_KEY,
	);
	const borderRadiusConversion = getBorderRadiusConversion(
		sequencePropStatuses,
		getDragOverrides(nodePathInfo.sequenceSubscriptionKey),
	);
	const inlineCaptionValue =
		schema.captions?.type === 'remotion-captions'
			? runtimeValues.captions
			: null;
	const inlineCaptions = Array.isArray(inlineCaptionValue)
		? (inlineCaptionValue as Caption[])
		: null;
	const showEffectsSection =
		nodePathInfo.supportsEffects || effectRows.length > 0;
	const canAddEffect =
		nodePathInfo.supportsEffects &&
		previewServerState.type === 'connected' &&
		isStudioInteractivityEnabled() &&
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

	const borderRadiusAction = borderRadiusGroup ? (
		<InlineAction
			variant={null}
			disabled={
				borderRadiusConversion === null ||
				previewServerState.type !== 'connected'
			}
			onClick={onConvertBorderRadius}
			title={
				borderRadiusConversion === null
					? borderRadiusUsesShorthand
						? 'A static border radius is required to use individual corners'
						: 'All four corners must have the same static value'
					: borderRadiusUsesShorthand
						? 'Use individual corner radii'
						: 'Use one border radius value'
			}
			renderAction={(color) =>
				borderRadiusUsesShorthand ? (
					<FullscreenIcon color={color} style={borderRadiusToggleIcon} />
				) : (
					<BorderRadiusIcon color={color} style={borderRadiusToggleIcon} />
				)
			}
		/>
	) : null;

	const effectsHeader = (
		<div style={sectionHeaderRow}>
			<div style={effectsHeaderTitle}>Effects</div>
			<InlineAction
				variant={null}
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

	const renderControlGroupHeader = (group: InspectorControlGroup) => {
		const collapsible = isSmartCollapsibleInspectorGroup(group.id);
		const expanded = isControlGroupExpanded(group);
		if (collapsible) {
			return (
				<CollapsibleInspectorSectionHeader
					action={
						group.id === 'border-radius' && expanded ? borderRadiusAction : null
					}
					expanded={expanded}
					label={group.label}
					onToggle={() => toggleControlGroup(group)}
				/>
			);
		}

		return (
			<div style={sectionHeaderRow}>
				<div style={effectsHeaderTitle}>{group.label}</div>
			</div>
		);
	};

	if (
		controlRows.length === 0 &&
		!showEffectsSection &&
		inlineCaptions === null
	) {
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
							<InspectorSection
								key={group.id}
								header={renderControlGroupHeader(group)}
							>
								{isControlGroupExpanded(group) ? (
									<>
										{group.id === 'transforms'
											? renderTransformControls()
											: null}
										{group.rows.map(renderRow)}
									</>
								) : null}
							</InspectorSection>
						))}
					</TimelineSelectionOrderProvider>
				) : null}
				{inlineCaptions ? (
					<InlineCaptionInspector
						captions={inlineCaptions}
						controls={sequence.controls}
						nodePath={nodePathInfo.sequenceSubscriptionKey}
						readOnlyStudio={readOnlyStudio}
						validatedLocation={validatedLocation}
					/>
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
						<InspectorSection header={renderControlGroupHeader(layoutGroup)}>
							{isControlGroupExpanded(layoutGroup)
								? layoutGroup.rows.map(renderRow)
								: null}
						</InspectorSection>
					</TimelineSelectionOrderProvider>
				) : null}
			</div>
		</AssetSelectionContext.Provider>
	);
};
