import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {
	_InternalTypes,
	CanUpdateSequencePropStatus,
	PropStatuses,
} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	BACKGROUND,
	BLUE,
	BORDER_COLOR,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	LINE_COLOR,
} from '../helpers/colors';
import type {TrackWithHash} from '../helpers/get-timeline-sequence-sort-key';
import type {Guide} from '../state/editor-guides';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../state/editor-guides';
import {CurrentAsset} from './CurrentAsset';
import {CurrentComposition} from './CurrentComposition';
import {DefaultPropsEditor} from './DefaultPropsEditor';
import {useZodIfPossible} from './get-zod-if-possible';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from './InspectorPanelLayout';
import {InspectorSequenceSection} from './InspectorSequenceSection';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {InputDragger} from './NewComposition/InputDragger';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {ObserveDefaultPropsContext} from './ObserveDefaultPropsContext';
import {
	type DataEditorMode,
	type RenderModalWarning,
	useDataEditorWarnings,
	useDataEditorWarningVisibility,
} from './RenderModal/DataEditor';
import type {AnyZodSchema} from './RenderModal/SchemaEditor/zod-schema-type';
import {getZodSchemaType} from './RenderModal/SchemaEditor/zod-schema-type';
import type {UpdaterFunction} from './RenderModal/SchemaEditor/ZodSwitch';
import {WarningIndicatorButton} from './RenderModal/WarningIndicatorButton';
import type {SegmentedControlItem} from './SegmentedControl';
import {SegmentedControl} from './SegmentedControl';
import {EasingEditor} from './Timeline/EasingEditorModal';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
import {getTimelineKeyframes} from './Timeline/get-timeline-keyframes';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {
	getTimelineSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from './Timeline/TimelineSelection';
import {
	getTimelineEasingValueForSelection,
	type EasingSelection,
} from './Timeline/update-selected-easing';
import {useOpenSequenceInEditor} from './Timeline/use-open-sequence-in-editor';
import {VisualControlsContent} from './VisualControls/VisualControlsContent';

const container: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	color: 'white',
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	height: '100%',
	minHeight: 0,
};

const scrollableContainer: React.CSSProperties = {
	...container,
	overflowY: 'auto',
};

const defaultPropsSection: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

const visualControlsSection: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

const compositionSection: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

const inspectorSectionDivider: React.CSSProperties = {
	borderBottom: `1px solid ${LINE_COLOR}`,
};

const sectionHeader: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	fontWeight: 'bold',
	padding: `8px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

const sectionHeaderRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 8,
	justifyContent: 'space-between',
	minWidth: 0,
};

const sectionHeaderTitle: React.CSSProperties = {
	color: LIGHT_TEXT,
	flexShrink: 0,
	fontSize: 12,
	fontWeight: 'bold',
	lineHeight: '16px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const sectionHeaderStart: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 8,
	minWidth: 0,
};

const sectionHeaderEnd: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
};

const defaultPropsWarningContainer: React.CSSProperties = {
	alignItems: 'flex-start',
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px 8px`,
};

const defaultPropsWarningMessages: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
};

const resolveLinkStyle: React.CSSProperties = {
	color: BLUE,
	fontFamily: 'sans-serif',
	fontSize: 12,
	textDecoration: 'underline',
	whiteSpace: 'nowrap',
};

const selectedContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	flex: 1,
	minHeight: 0,
	overflowY: 'auto',
};

const centeredMessage: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	display: 'flex',
	flex: 1,
	fontSize: 14,
	justifyContent: 'center',
	padding: 24,
	textAlign: 'center',
};

const detailsContainer: React.CSSProperties = {
	padding: INSPECTOR_PANEL_HORIZONTAL_PADDING,
};

const guideDetailsContainer: React.CSSProperties = {
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

const detailRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 12,
	justifyContent: 'space-between',
	padding: '10px 0',
};

const detailLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
};

const detailValue: React.CSSProperties = {
	color: 'white',
	fontSize: 13,
	fontVariantNumeric: 'tabular-nums',
	minWidth: 0,
	textAlign: 'right',
	wordBreak: 'break-word',
};

const valueBlock: React.CSSProperties = {
	backgroundColor: INPUT_BACKGROUND,
	border: `1px solid ${BORDER_COLOR}`,
	borderRadius: 4,
	color: 'white',
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.5,
	margin: '12px 0 0',
	overflowX: 'auto',
	padding: 12,
	whiteSpace: 'pre-wrap',
};

type SequenceSectionSelection = Extract<
	TimelineSelection,
	{
		type:
			| 'sequence'
			| 'sequence-prop'
			| 'sequence-all-effects'
			| 'sequence-effect'
			| 'sequence-effect-prop';
	}
>;

const isSequenceSectionSelection = (
	selection: TimelineSelection,
): selection is SequenceSectionSelection => {
	return (
		selection.type === 'sequence' ||
		selection.type === 'sequence-prop' ||
		selection.type === 'sequence-all-effects' ||
		selection.type === 'sequence-effect' ||
		selection.type === 'sequence-effect-prop'
	);
};

const formatInspectableValue = (value: unknown): string => {
	if (value === undefined) {
		return 'undefined';
	}

	if (typeof value === 'string') {
		return JSON.stringify(value);
	}

	try {
		const json = JSON.stringify(value, null, 2);
		return json ?? String(value);
	} catch {
		return String(value);
	}
};

const InspectorSectionHeader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={sectionHeader}>{children}</div>;

const InspectorMessage: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => <div style={centeredMessage}>{children}</div>;

const InspectorDetailRow: React.FC<{
	readonly label: string;
	readonly children: React.ReactNode;
}> = ({label, children}) => (
	<div style={detailRow}>
		<div style={detailLabel}>{label}</div>
		<div style={detailValue}>{children}</div>
	</div>
);

const InspectorDefaultPropsWarnings: React.FC<{
	readonly warnings: RenderModalWarning[];
}> = ({warnings}) => {
	return (
		<div style={defaultPropsWarningMessages}>
			{warnings.map((warning) => (
				<ValidationMessage
					key={warning.id}
					message={warning.message}
					align="flex-start"
					type="warning"
					size="compact"
					action={
						warning.resolveLink ? (
							<a
								href={warning.resolveLink}
								target="_blank"
								rel="noopener noreferrer"
								style={resolveLinkStyle}
							>
								Resolve
							</a>
						) : null
					}
				/>
			))}
		</div>
	);
};

const useSequenceDisplayName = (track: TrackWithHash) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const nodePath = track.nodePathInfo?.sequenceSubscriptionKey ?? null;

	return useMemo(() => {
		const propStatusesForOverride = nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
		const codeNameStatus = propStatusesForOverride?.name;
		const displayName =
			codeNameStatus &&
			codeNameStatus.status === 'static' &&
			typeof codeNameStatus.codeValue === 'string'
				? codeNameStatus.codeValue
				: track.sequence.displayName;

		return displayName || '<Sequence>';
	}, [nodePath, propStatuses, track.sequence.displayName]);
};

const useTrackForSelection = (selection: TimelineSelection) => {
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);

	return useMemo(() => {
		if (selection.type === 'guide') {
			return null;
		}

		return (
			findTrackForNodePathInfo({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				nodePathInfo: selection.nodePathInfo,
			}) ?? null
		);
	}, [overrideIdToNodePathMappings, selection, sequences]);
};

const SequenceExpandedInspector: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {originalLocation} = useOpenSequenceInEditor(track.sequence);
	const sequenceDisplayName = useSequenceDisplayName(track);

	const validatedLocation = useMemo(() => {
		if (
			!originalLocation ||
			!originalLocation.source ||
			!originalLocation.line
		) {
			return null;
		}

		return {
			source: originalLocation.source,
			line: originalLocation.line,
			column: originalLocation.column ?? 0,
		};
	}, [originalLocation]);

	if (previewServerState.type !== 'connected') {
		return <InspectorMessage>Studio server disconnected</InspectorMessage>;
	}

	if (!track.nodePathInfo || !track.sequence.controls || !validatedLocation) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<InspectorSectionHeader>{sequenceDisplayName}</InspectorSectionHeader>
			<InspectorSequenceSection
				sequence={track.sequence}
				validatedLocation={validatedLocation}
				nodePathInfo={track.nodePathInfo}
				keyframeDisplayOffset={track.keyframeDisplayOffset}
				renderSectionHeader={(children) => (
					<InspectorSectionHeader>{children}</InspectorSectionHeader>
				)}
			/>
		</div>
	);
};

const SequenceSelectionInspector: React.FC<{
	readonly selection: SequenceSectionSelection;
}> = ({selection}) => {
	const track = useTrackForSelection(selection);

	if (!track) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	return <SequenceExpandedInspector track={track} />;
};

const getSequenceFieldLabel = ({
	track,
	fieldKey,
	effectIndex,
}: {
	readonly track: TrackWithHash;
	readonly fieldKey: string;
	readonly effectIndex: number | null;
}) => {
	const schemaField =
		effectIndex === null
			? track.sequence.controls?.schema[fieldKey]
			: track.sequence.effects[effectIndex]?.schema[fieldKey];

	if (schemaField && 'description' in schemaField && schemaField.description) {
		return schemaField.description;
	}

	return fieldKey;
};

const getKeyframedStatusForSelection = ({
	selection,
	track,
	propStatuses,
}: {
	readonly selection: Extract<TimelineSelection, {type: 'keyframe'}>;
	readonly track: TrackWithHash;
	readonly propStatuses: PropStatuses;
}): {
	readonly fieldLabel: string;
	readonly propStatus: CanUpdateSequencePropStatus | null;
} | null => {
	const field = parseKeyframeFieldFromNodePath(
		selection.nodePathInfo.auxiliaryKeys,
	);

	if (field === null) {
		return null;
	}

	if (field.type === 'sequence') {
		const sequencePropStatus = Internals.getPropStatusesCtx(
			propStatuses,
			selection.nodePathInfo.sequenceSubscriptionKey,
		)?.[field.fieldKey];

		return {
			fieldLabel: getSequenceFieldLabel({
				track,
				fieldKey: field.fieldKey,
				effectIndex: null,
			}),
			propStatus: sequencePropStatus ?? null,
		};
	}

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath: selection.nodePathInfo.sequenceSubscriptionKey,
		effectIndex: field.effectIndex,
	});
	const effectPropStatus =
		effectStatus.type === 'can-update-effect'
			? effectStatus.props[field.fieldKey]
			: null;

	return {
		fieldLabel: getSequenceFieldLabel({
			track,
			fieldKey: field.fieldKey,
			effectIndex: field.effectIndex,
		}),
		propStatus: effectPropStatus ?? null,
	};
};

const KeyframeInspector: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'keyframe'}>;
}> = ({selection}) => {
	const track = useTrackForSelection(selection);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);

	const details = useMemo(() => {
		if (!track) {
			return null;
		}

		const status = getKeyframedStatusForSelection({
			selection,
			track,
			propStatuses,
		});

		if (status === null || status.propStatus === null) {
			return null;
		}

		const keyframe = getTimelineKeyframes(
			status.propStatus,
			track.keyframeDisplayOffset,
		).find((candidate) => candidate.frame === selection.frame);

		if (!keyframe) {
			return null;
		}

		return {
			fieldLabel: status.fieldLabel,
			value: keyframe.value,
		};
	}, [propStatuses, selection, track]);

	if (details === null) {
		return <InspectorMessage>Keyframe unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<InspectorSectionHeader>Keyframe</InspectorSectionHeader>
			<div style={detailsContainer}>
				<InspectorDetailRow label="Frame">{selection.frame}</InspectorDetailRow>
				<InspectorDetailRow label="Property">
					{details.fieldLabel}
				</InspectorDetailRow>
				<div style={detailLabel}>Value</div>
				<pre style={valueBlock}>{formatInspectableValue(details.value)}</pre>
			</div>
		</div>
	);
};

const EasingInspector: React.FC<{
	readonly selection: EasingSelection;
}> = ({selection}) => {
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);

	const initialEasing = useMemo(
		() =>
			getTimelineEasingValueForSelection({
				selection,
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				propStatuses,
			}),
		[overrideIdToNodePathMappings, propStatuses, selection, sequences],
	);

	const state = useMemo(() => {
		if (initialEasing === null) {
			return null;
		}

		return {
			initialEasing,
			selections: [selection],
		};
	}, [initialEasing, selection]);

	if (state === null) {
		return <InspectorMessage>Easing unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<InspectorSectionHeader>Easing</InspectorSectionHeader>
			<EasingEditor key={getTimelineSelectionKey(selection)} state={state} />
		</div>
	);
};

const updateGuidePosition = ({
	guideId,
	persist,
	position,
	setGuidesList,
}: {
	readonly guideId: string;
	readonly persist: boolean;
	readonly position: number;
	readonly setGuidesList: (cb: (prevState: Guide[]) => Guide[]) => void;
}) => {
	setGuidesList((prevState) => {
		const newGuides = prevState.map((guide) => {
			if (guide.id !== guideId) {
				return guide;
			}

			return {
				...guide,
				position: Math.round(position),
				show: true,
			};
		});

		if (persist) {
			persistGuidesList(newGuides);
		}

		return newGuides;
	});
};

const GuideInspector: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'guide'}>;
}> = ({selection}) => {
	const {guidesList, setGuidesList} = useContext(EditorShowGuidesContext);
	const guide = guidesList.find(
		(candidate) => candidate.id === selection.guideId,
	);

	const onValueChange = useCallback(
		(value: number) => {
			updateGuidePosition({
				guideId: selection.guideId,
				persist: false,
				position: value,
				setGuidesList,
			});
		},
		[selection.guideId, setGuidesList],
	);

	const onValueChangeEnd = useCallback(
		(value: number) => {
			updateGuidePosition({
				guideId: selection.guideId,
				persist: true,
				position: value,
				setGuidesList,
			});
		},
		[selection.guideId, setGuidesList],
	);

	if (!guide) {
		return <InspectorMessage>Guide unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<InspectorSectionHeader>
				{guide.orientation === 'vertical' ? 'Vertical' : 'Horizontal'} guide
			</InspectorSectionHeader>
			<div style={guideDetailsContainer}>
				<InspectorDetailRow
					label={guide.orientation === 'vertical' ? 'X position' : 'Y position'}
				>
					<InputDragger
						type="number"
						value={guide.position}
						status="ok"
						onValueChange={onValueChange}
						onValueChangeEnd={onValueChangeEnd}
						onTextChange={() => undefined}
						step={1}
						formatter={(value) => String(Math.round(Number(value)))}
						rightAlign
						small
					/>
				</InspectorDetailRow>
			</div>
		</div>
	);
};

const DefaultInspector: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'] | null;
	readonly currentDefaultProps: Record<string, unknown>;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, setDefaultProps}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const hasSelectedAsset = canvasContent?.type === 'asset';
	const z = useZodIfPossible();
	const canSaveDefaultProps = useContext(ObserveDefaultPropsContext);
	const [defaultPropsMode, setDefaultPropsMode] =
		useState<DataEditorMode>('schema');
	const compositionId = composition?.id ?? null;

	useEffect(() => {
		setDefaultPropsMode('schema');
	}, [compositionId]);

	const defaultPropsModeItems = useMemo((): SegmentedControlItem[] => {
		return [
			{
				key: 'schema',
				label: 'Schema',
				onClick: () => {
					setDefaultPropsMode('schema');
				},
				selected: defaultPropsMode === 'schema',
			},
			{
				key: 'json',
				label: 'JSON',
				onClick: () => {
					setDefaultPropsMode('json');
				},
				selected: defaultPropsMode === 'json',
			},
		];
	}, [defaultPropsMode]);

	const canShowDefaultPropsMode = useMemo(() => {
		if (!z || !composition?.schema || !composition.defaultProps) {
			return false;
		}

		if (
			!(
				typeof (composition.schema as {safeParse?: unknown}).safeParse ===
				'function'
			)
		) {
			return false;
		}

		return getZodSchemaType(composition.schema as AnyZodSchema) !== 'any';
	}, [composition?.defaultProps, composition?.schema, z]);
	const {setShowWarning, showWarning} = useDataEditorWarningVisibility();
	const {warnings: defaultPropsWarnings} = useDataEditorWarnings({
		canSaveDefaultProps: canSaveDefaultProps?.canSaveDefaultProps ?? null,
		defaultProps: currentDefaultProps,
		mode: defaultPropsMode,
		propsEditType: 'default-props',
	});

	if (hasSelectedAsset) {
		return (
			<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				<div style={compositionSection}>
					<CurrentAsset />
				</div>
			</div>
		);
	}

	if (composition === null) {
		return <div style={container} />;
	}

	return (
		<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<div style={compositionSection}>
				<CurrentComposition />
			</div>
			<div style={inspectorSectionDivider} />
			<div style={defaultPropsSection}>
				<InspectorSectionHeader>
					<div style={sectionHeaderRow}>
						<div style={sectionHeaderStart}>
							<span style={sectionHeaderTitle}>Default Props</span>
							{canShowDefaultPropsMode ? (
								<SegmentedControl
									items={defaultPropsModeItems}
									needsWrapping={false}
									size="compact"
								/>
							) : null}
						</div>
						<div style={sectionHeaderEnd}>
							{defaultPropsWarnings.length > 0 ? (
								<WarningIndicatorButton
									setShowWarning={setShowWarning}
									showWarning={showWarning}
									warningCount={defaultPropsWarnings.length}
									size="compact"
								/>
							) : null}
						</div>
					</div>
				</InspectorSectionHeader>
				{defaultPropsWarnings.length > 0 && showWarning ? (
					<div style={defaultPropsWarningContainer}>
						<InspectorDefaultPropsWarnings warnings={defaultPropsWarnings} />
					</div>
				) : null}
				<DefaultPropsEditor
					key={composition.id}
					unresolvedComposition={composition}
					defaultProps={currentDefaultProps}
					setDefaultProps={setDefaultProps}
					propsEditType="default-props"
					schemaErrorAlignment="left"
					schemaErrorMode="compact"
					layout="inspector"
					mode={defaultPropsMode}
					onModeChange={setDefaultPropsMode}
					hideModeControls={canShowDefaultPropsMode}
					warnings={defaultPropsWarnings}
					showWarning={false}
					setShowWarning={setShowWarning}
					hideWarningButton
				/>
			</div>
			<div style={inspectorSectionDivider} />
			<div style={visualControlsSection}>
				<InspectorSectionHeader>Visual Controls</InspectorSectionHeader>
				<VisualControlsContent />
			</div>
		</div>
	);
};

const SelectedInspector: React.FC<{
	readonly selection: TimelineSelection;
}> = ({selection}) => {
	if (isSequenceSectionSelection(selection)) {
		return <SequenceSelectionInspector selection={selection} />;
	}

	if (selection.type === 'keyframe') {
		return <KeyframeInspector selection={selection} />;
	}

	if (selection.type === 'easing') {
		return <EasingInspector selection={selection} />;
	}

	if (selection.type === 'guide') {
		return <GuideInspector selection={selection} />;
	}

	return <InspectorMessage>Inspector unavailable</InspectorMessage>;
};

export const InspectorPanel: React.FC<{
	readonly composition: _InternalTypes['AnyComposition'] | null;
	readonly currentDefaultProps: Record<string, unknown>;
	readonly setDefaultProps: UpdaterFunction<Record<string, unknown>>;
}> = ({composition, currentDefaultProps, setDefaultProps}) => {
	const {selectedItems} = useTimelineSelection();

	if (selectedItems.length === 0) {
		return (
			<DefaultInspector
				composition={composition}
				currentDefaultProps={currentDefaultProps}
				setDefaultProps={setDefaultProps}
			/>
		);
	}

	if (selectedItems.length > 1) {
		return (
			<div style={container}>
				<InspectorMessage>
					{selectedItems.length} items selected
				</InspectorMessage>
			</div>
		);
	}

	return (
		<div style={container}>
			<SelectedInspector selection={selectedItems[0]} />
		</div>
	);
};
