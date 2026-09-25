import {
	isSchemaFieldHoldOnly,
	isSchemaFieldKeyframable,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	InteractivitySchema,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {formatContextForAgents} from '../../helpers/format-file-location';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {openOriginalPositionInEditorAtProperty} from '../../helpers/open-in-editor';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {ContextMenu} from '../ContextMenu';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {useEditorOpening} from '../use-default-editor-info';
import {callAddSequenceKeyframe} from './call-add-keyframe';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';
import {getPlaybackRateKeyframeChanges} from './get-playback-rate-keyframe-changes';
import {getSequencePropResetChanges} from './get-sequence-prop-reset-changes';
import {
	getKeyframeDisplayOffset,
	getKeyframeSourceFrame,
} from './get-timeline-keyframes';
import {saveSequenceProps} from './save-sequence-prop';
import {isTimelineFieldStacked} from './timeline-field-row-layout';
import {TimelineExpandArrowSpacer} from './TimelineExpandArrowButton';
import {TimelineFieldLabel} from './TimelineFieldLabel';
import {TimelineFieldRowContent} from './TimelineFieldRowContent';
import {
	shouldShowTimelineKeyframeControls,
	TimelineKeyframeControls,
	type TimelineKeyframeControlsMode,
} from './TimelineKeyframeControls';
import {TimelineKeyframedValue} from './TimelineKeyframedValue';
import {TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	TimelineFieldValue,
	TimelineNonEditableStatus,
} from './TimelineSchemaField';
import {
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';
import {Transform3DModeContext} from './Transform3DModeContext';

const fieldRowBase: React.CSSProperties = {};

const inlineSourceFieldRow: React.CSSProperties = {
	alignItems: 'stretch',
	display: 'flex',
	minWidth: 0,
	width: '100%',
};

const computedSourceFieldRow: React.CSSProperties = {
	boxSizing: 'border-box',
	paddingInline: INSPECTOR_PANEL_HORIZONTAL_PADDING,
};

const isKeyframedStatus = (
	status: CanUpdateSequencePropStatus,
): status is CanUpdateSequencePropStatusKeyframed => {
	return status.status === 'keyframed';
};

const isResettableStatus = ({
	status,
	defaultValue,
}: {
	readonly status: CanUpdateSequencePropStatus;
	readonly defaultValue: unknown;
}) => {
	if (defaultValue === undefined) {
		return false;
	}

	if (status.status === 'keyframed') {
		return true;
	}

	if (status.status === 'computed') {
		return false;
	}

	const effectiveCodeValue = status.codeValue ?? defaultValue;
	return JSON.stringify(effectiveCodeValue) !== JSON.stringify(defaultValue);
};

const getPlaybackRateAdjustedDuration = ({
	durationInFrames,
	previousPlaybackRate,
	playbackRate,
}: {
	readonly durationInFrames: number;
	readonly previousPlaybackRate: number;
	readonly playbackRate: number;
}): number | null => {
	const adjustedDuration =
		(durationInFrames * previousPlaybackRate) / playbackRate;
	if (!Number.isFinite(adjustedDuration) || adjustedDuration <= 0) {
		return null;
	}

	const nearestInteger = Math.round(adjustedDuration);
	return nearestInteger > 0 &&
		Math.abs(adjustedDuration - nearestInteger) <=
			Number.EPSILON * Math.max(1, Math.abs(adjustedDuration)) * 2
		? nearestInteger
		: adjustedDuration;
};

const Value: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly schema: InteractivitySchema;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly durationPropStatus: CanUpdateSequencePropStatus | null;
}> = ({
	field,
	nodePath,
	validatedLocation,
	schema,
	propStatus,
	durationPropStatus,
}) => {
	const playbackRateBaseline = useRef<{
		durationInFrames: number;
		playbackRate: number;
		lastSavedDurationInFrames: number;
		lastSavedPlaybackRate: number;
	} | null>(null);
	const previewedKeyframes = useRef<
		ReturnType<typeof getPlaybackRateKeyframeChanges>['previews']
	>([]);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const getPlaybackRateChanges = useCallback(
		(value: unknown) => {
			if (
				field.key !== 'playbackRate' ||
				nodePath === null ||
				typeof value !== 'number'
			) {
				return null;
			}

			const currentStatus = Internals.getPropStatusesCtx(
				propStatusesRef.current,
				nodePath,
			)?.playbackRate;
			const previousPlaybackRate =
				currentStatus?.status === 'static' &&
				typeof currentStatus.codeValue === 'number'
					? currentStatus.codeValue
					: field.fieldSchema.default;
			if (typeof previousPlaybackRate !== 'number') {
				return null;
			}

			return getPlaybackRateKeyframeChanges({
				nodePath,
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				propStatuses: propStatusesRef.current,
				previousPlaybackRate,
				playbackRate: value,
			});
		},
		[
			field.fieldSchema.default,
			field.key,
			nodePath,
			overrideIdToNodePathMappings,
			propStatusesRef,
			sequencesRef,
		],
	);
	const getAdjustedDuration = useCallback(
		(playbackRate: unknown): number | null => {
			if (
				field.key !== 'playbackRate' ||
				!schema.durationInFrames ||
				durationPropStatus?.status !== 'static' ||
				typeof durationPropStatus.codeValue !== 'number' ||
				!Number.isFinite(durationPropStatus.codeValue) ||
				typeof playbackRate !== 'number' ||
				!Number.isFinite(playbackRate) ||
				playbackRate <= 0
			) {
				return null;
			}

			const currentPlaybackRate =
				typeof propStatus.codeValue === 'number'
					? propStatus.codeValue
					: field.fieldSchema.default;
			if (
				typeof currentPlaybackRate !== 'number' ||
				!Number.isFinite(currentPlaybackRate) ||
				currentPlaybackRate <= 0
			) {
				return null;
			}

			const currentDuration = durationPropStatus.codeValue;
			let baseline = playbackRateBaseline.current;
			// Keep the first duration and rate across successive rate edits. A change
			// to either prop outside this control starts a new baseline.
			if (
				baseline === null ||
				!(
					(currentDuration === baseline.durationInFrames &&
						currentPlaybackRate === baseline.playbackRate) ||
					(currentDuration === baseline.lastSavedDurationInFrames &&
						currentPlaybackRate === baseline.lastSavedPlaybackRate)
				)
			) {
				baseline = {
					durationInFrames: currentDuration,
					playbackRate: currentPlaybackRate,
					lastSavedDurationInFrames: currentDuration,
					lastSavedPlaybackRate: currentPlaybackRate,
				};
				playbackRateBaseline.current = baseline;
			}

			return getPlaybackRateAdjustedDuration({
				durationInFrames: baseline.durationInFrames,
				previousPlaybackRate: baseline.playbackRate,
				playbackRate,
			});
		},
		[
			durationPropStatus,
			field.fieldSchema.default,
			field.key,
			propStatus.codeValue,
			schema.durationInFrames,
		],
	);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {
		setDragOverrides,
		clearDragOverrides,
		setEffectDragOverrides,
		clearEffectDragOverrides,
	} = useContext(Internals.VisualModeSettersContext);
	const dragOverrideValue = useMemo(() => {
		return nodePath === null
			? undefined
			: (getDragOverrides(nodePath) ?? {})[field.key];
	}, [getDragOverrides, nodePath, field.key]);

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		propStatus,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
		shouldResortToDefaultValueIfUndefined: true,
	});

	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const onSave = useCallback<TimelineFieldOnSave>(
		(value, options) => {
			if (!clientId) {
				return Promise.reject(new Error('Not connected to studio server'));
			}

			const defaultValue =
				field.fieldSchema.type === 'text-content'
					? null
					: field.fieldSchema.default !== undefined
						? JSON.stringify(field.fieldSchema.default)
						: null;

			const stringifiedValue = JSON.stringify(value);
			const fieldLabel = field.description ?? field.key;
			const adjustedDuration = getAdjustedDuration(value);

			if (value === propStatus.codeValue) {
				return Promise.resolve();
			}

			if (
				defaultValue === stringifiedValue &&
				propStatus.codeValue === undefined
			) {
				return Promise.resolve();
			}

			if (adjustedDuration !== null && playbackRateBaseline.current) {
				playbackRateBaseline.current.lastSavedDurationInFrames =
					adjustedDuration;
				playbackRateBaseline.current.lastSavedPlaybackRate = value as number;
			}

			return unstable_batchedUpdates(() =>
				saveSequenceProps({
					addedKeyframes: null,
					movedKeyframes: null,
					changes: [
						{
							fileName: validatedLocation.source,
							nodePath,
							fieldKey: field.key,
							value,
							defaultValue,
							schema,
							sourceEdit:
								field.key === 'playbackRate'
									? {type: 'playback-rate'}
									: options?.sourceEdit,
						},
						...(adjustedDuration === null
							? []
							: [
									{
										fileName: validatedLocation.source,
										nodePath,
										fieldKey: 'durationInFrames',
										value: adjustedDuration,
										defaultValue: null,
										schema,
									},
								]),
					],
					setPropStatuses,
					clientId,
					undoLabel: `Update ${fieldLabel}`,
					redoLabel: `Update ${fieldLabel} again`,
				}),
			);
		},
		[
			propStatus,
			clientId,
			field.description,
			field.fieldSchema.default,
			field.fieldSchema.type,
			field.key,
			getAdjustedDuration,
			nodePath,
			schema,
			setPropStatuses,
			validatedLocation,
		],
	);

	const onDragValueChange = useCallback<TimelineFieldOnDragValueChange>(
		(value) => {
			if (nodePath === null) {
				throw new Error('Cannot drag value');
			}

			const adjustedDuration = getAdjustedDuration(value);
			const keyframeChanges = getPlaybackRateChanges(value);
			unstable_batchedUpdates(() => {
				for (const preview of previewedKeyframes.current) {
					if (preview.effectIndex === null) {
						clearDragOverrides(preview.nodePath);
					} else {
						clearEffectDragOverrides(preview.nodePath, preview.effectIndex);
					}
				}

				previewedKeyframes.current = keyframeChanges?.previews ?? [];
				setDragOverrides(
					nodePath,
					field.key,
					Internals.makeStaticDragOverride(value),
				);
				if (adjustedDuration !== null) {
					setDragOverrides(
						nodePath,
						'durationInFrames',
						Internals.makeStaticDragOverride(adjustedDuration),
					);
				}

				for (const preview of previewedKeyframes.current) {
					if (preview.effectIndex === null) {
						setDragOverrides(preview.nodePath, preview.fieldKey, {
							type: 'keyframed',
							status: preview.status,
						});
					} else {
						setEffectDragOverrides(
							preview.nodePath,
							preview.effectIndex,
							preview.fieldKey,
							{type: 'keyframed', status: preview.status},
						);
					}
				}
			});
		},
		[
			clearDragOverrides,
			clearEffectDragOverrides,
			setDragOverrides,
			setEffectDragOverrides,
			nodePath,
			field.key,
			getAdjustedDuration,
			getPlaybackRateChanges,
		],
	);

	const onDragEnd = useCallback(() => {
		if (nodePath === null) {
			throw new Error('Cannot clear drag value');
		}

		clearDragOverrides(nodePath);
		for (const preview of previewedKeyframes.current) {
			if (preview.effectIndex === null) {
				clearDragOverrides(preview.nodePath);
			} else {
				clearEffectDragOverrides(preview.nodePath, preview.effectIndex);
			}
		}

		previewedKeyframes.current = [];
	}, [clearDragOverrides, clearEffectDragOverrides, nodePath]);

	return (
		<TimelineFieldValue
			field={field}
			propStatus={propStatus}
			onSave={onSave}
			onDragValueChange={onDragValueChange}
			onDragEnd={onDragEnd}
			effectiveValue={effectiveValue}
			scaleLockNodePath={nodePath}
		/>
	);
};

type TimelineSequenceKeyframedValueBaseProps = {
	readonly field: SchemaFieldInfo;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
};

type TimelineSequenceKeyframedValueProps =
	TimelineSequenceKeyframedValueBaseProps &
		(
			| {
					readonly sourceFrame: number;
					readonly keyframeDisplayOffset?: never;
					readonly keyframePlaybackRate?: never;
			  }
			| {
					readonly sourceFrame?: never;
					readonly keyframeDisplayOffset: number;
					readonly keyframePlaybackRate: number;
			  }
		);

type TimelineSequenceKeyframedValueAtSourceFrameProps = Pick<
	TimelineSequenceKeyframedValueBaseProps,
	'field' | 'nodePath' | 'propStatus'
> & {
	readonly sourceFrame: number;
	readonly dragOverrideValue:
		| ReturnType<typeof Internals.makeKeyframedDragOverride>
		| undefined;
	readonly onSave: (value: unknown, frame: number) => Promise<void>;
	readonly onDragValueChangeAtFrame: (
		value: unknown,
		sourceFrame: number,
	) => void;
	readonly onDragEnd: () => void;
};

const TimelineSequenceKeyframedValueAtSourceFrame: React.FC<
	TimelineSequenceKeyframedValueAtSourceFrameProps
> = ({
	field,
	nodePath,
	propStatus,
	sourceFrame,
	dragOverrideValue,
	onSave,
	onDragValueChangeAtFrame,
	onDragEnd,
}) => {
	const onDragValueChange = useCallback<TimelineFieldOnDragValueChange>(
		(value) => onDragValueChangeAtFrame(value, sourceFrame),
		[onDragValueChangeAtFrame, sourceFrame],
	);

	return (
		<TimelineKeyframedValue
			field={field}
			propStatus={propStatus}
			sourceFrame={sourceFrame}
			dragOverrideValue={dragOverrideValue}
			onSave={onSave}
			onDragValueChange={onDragValueChange}
			onDragEnd={onDragEnd}
			scaleLockNodePath={nodePath}
		/>
	);
};

const TimelineSequenceKeyframedValueAtCurrentFrame: React.FC<
	Omit<TimelineSequenceKeyframedValueAtSourceFrameProps, 'sourceFrame'> & {
		readonly keyframeDisplayOffset: number;
		readonly keyframePlaybackRate: number;
	}
> = ({keyframeDisplayOffset, keyframePlaybackRate, ...props}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const resolvedKeyframeDisplayOffset = getKeyframeDisplayOffset({
		propStatus: props.propStatus,
		keyframeDisplayOffset,
		keyframePlaybackRate,
	});

	return (
		<TimelineSequenceKeyframedValueAtSourceFrame
			{...props}
			sourceFrame={getKeyframeSourceFrame({
				displayFrame: timelinePosition,
				keyframeDisplayOffset: resolvedKeyframeDisplayOffset,
				keyframePlaybackRate,
				propStatus: props.propStatus,
			})}
		/>
	);
};

const TimelineSequenceKeyframedValueUnmemoized: React.FC<
	TimelineSequenceKeyframedValueProps
> = (props) => {
	const {field, fileName, nodePath, schema, propStatus} = props;
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const dragOverrideValue = useMemo(() => {
		return (getDragOverrides(nodePath) ?? {})[field.key];
	}, [getDragOverrides, nodePath, field.key]);

	const onSaveKeyframed = useCallback(
		(value: unknown, frame: number) => {
			if (!clientId) {
				return Promise.reject(new Error('Not connected to studio server'));
			}

			return callAddSequenceKeyframe({
				fileName,
				nodePath,
				fieldKey: field.key,
				sourceFrame: frame,
				value,
				schema,
				setPropStatuses,
				clientId,
			});
		},
		[clientId, field.key, fileName, nodePath, schema, setPropStatuses],
	);

	const onKeyframedDragValueChangeAtFrame = useCallback(
		(value: unknown, sourceFrame: number) => {
			setDragOverrides(
				nodePath,
				field.key,
				Internals.makeKeyframedDragOverride({
					status: propStatus,
					frame: sourceFrame,
					value,
					defaultEasing: isSchemaFieldHoldOnly({
						schema,
						key: field.key,
					})
						? {type: 'step1'}
						: undefined,
				}),
			);
		},
		[propStatus, field.key, nodePath, schema, setDragOverrides],
	);

	const onKeyframedDragEnd = useCallback(() => {
		clearDragOverrides(nodePath);
	}, [clearDragOverrides, nodePath]);

	const valueProps = {
		field,
		nodePath,
		propStatus,
		dragOverrideValue,
		onSave: onSaveKeyframed,
		onDragValueChangeAtFrame: onKeyframedDragValueChangeAtFrame,
		onDragEnd: onKeyframedDragEnd,
	};

	return props.sourceFrame !== undefined ? (
		<TimelineSequenceKeyframedValueAtSourceFrame
			{...valueProps}
			sourceFrame={props.sourceFrame}
		/>
	) : (
		<TimelineSequenceKeyframedValueAtCurrentFrame
			{...valueProps}
			keyframeDisplayOffset={props.keyframeDisplayOffset}
			keyframePlaybackRate={props.keyframePlaybackRate}
		/>
	);
};

export const TimelineSequenceKeyframedValue = React.memo(
	TimelineSequenceKeyframedValueUnmemoized,
);

export const TimelineSequencePropItem: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly schema: InteractivitySchema;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly keyframeControlsMode: TimelineKeyframeControlsMode;
	readonly runtimeValue: unknown;
}> = ({
	field,
	validatedLocation,
	rowDepth,
	nodePath,
	nodePathInfo,
	schema,
	keyframeDisplayOffset,
	keyframePlaybackRate,
	keyframeControlsMode,
	runtimeValue,
}) => {
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);

	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canOpenInEditor, defaultEditorId} = useEditorOpening(
		previewServerState.type === 'connected',
	);
	const selection = useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const transform3DMode = useContext(Transform3DModeContext);
	const propStatusesForOverride = Internals.getPropStatusesCtx(
		visualModePropStatuses,
		nodePath,
	);
	const propStatus = propStatusesForOverride?.[field.key] ?? null;

	const dragOverrideValue = useMemo(() => {
		return (getDragOverrides(nodePath) ?? {})[field.key];
	}, [getDragOverrides, nodePath, field.key]);

	const keyframable = isSchemaFieldKeyframable({
		schema,
		key: field.key,
	});
	const keyframeControls =
		propStatus !== null &&
		(keyframeControlsMode === 'inspector'
			? keyframable
			: shouldShowTimelineKeyframeControls({
					propStatus,
					selected: selection.selected,
					keyframable,
				})) ? (
			<TimelineKeyframeControls
				fieldKey={field.key}
				propStatus={propStatus}
				nodePath={nodePath}
				fileName={validatedLocation.source}
				keyframeDisplayOffset={keyframeDisplayOffset}
				keyframePlaybackRate={keyframePlaybackRate}
				defaultValue={field.fieldSchema.default}
				dragOverrideValue={dragOverrideValue}
				schema={schema}
				effectIndex={null}
				nodePathInfo={nodePathInfo}
				mode={keyframeControlsMode}
			/>
		) : null;

	const hidePathValue =
		keyframeControlsMode === 'timeline' && field.typeName === 'svg-path';

	const style = useMemo((): React.CSSProperties => {
		return !hidePathValue && isTimelineFieldStacked({field, transform3DMode})
			? fieldRowBase
			: {...fieldRowBase, height: field.rowHeight};
	}, [field, hidePathValue, transform3DMode]);

	const canResetToDefault = useMemo(() => {
		if (!propStatus || propStatus.status === 'computed') {
			return false;
		}

		return isResettableStatus({
			status: propStatus,
			defaultValue: field.fieldSchema.default,
		});
	}, [propStatus, field.fieldSchema.default]);

	const canPerformReset =
		previewServerState.type === 'connected' &&
		propStatus !== null &&
		propStatus.status !== 'computed';
	const canShowReset =
		canPerformReset && field.fieldSchema.default !== undefined;

	const onReset = useCallback(() => {
		if (
			!canShowReset ||
			!canResetToDefault ||
			previewServerState.type !== 'connected' ||
			propStatus === null
		) {
			return;
		}

		const defaultValue =
			field.fieldSchema.default !== undefined
				? JSON.stringify(field.fieldSchema.default)
				: null;
		const fieldLabel = field.description ?? field.key;
		const previousPlaybackRate =
			field.key === 'playbackRate' &&
			propStatus.status === 'static' &&
			typeof propStatus.codeValue === 'number'
				? propStatus.codeValue
				: null;
		const nextPlaybackRate = field.fieldSchema.default;
		const canRetime =
			previousPlaybackRate !== null &&
			Number.isFinite(previousPlaybackRate) &&
			previousPlaybackRate > 0 &&
			typeof nextPlaybackRate === 'number' &&
			Number.isFinite(nextPlaybackRate) &&
			nextPlaybackRate > 0;

		const durationStatus = propStatusesForOverride?.durationInFrames;
		const adjustedDuration =
			canRetime &&
			schema.durationInFrames &&
			durationStatus?.status === 'static' &&
			typeof durationStatus.codeValue === 'number' &&
			Number.isFinite(durationStatus.codeValue)
				? getPlaybackRateAdjustedDuration({
						durationInFrames: durationStatus.codeValue,
						previousPlaybackRate,
						playbackRate: nextPlaybackRate,
					})
				: null;

		saveSequenceProps({
			addedKeyframes: null,
			movedKeyframes: null,
			changes: [
				...getSequencePropResetChanges({
					fileName: validatedLocation.source,
					nodePath,
					fieldKey: field.key,
					value: field.fieldSchema.default,
					defaultValue,
					schema,
				}).map((change) =>
					change.fieldKey === 'playbackRate'
						? {...change, sourceEdit: {type: 'playback-rate' as const}}
						: change,
				),
				...(adjustedDuration !== null
					? [
							{
								fileName: validatedLocation.source,
								nodePath,
								fieldKey: 'durationInFrames',
								value: adjustedDuration,
								defaultValue: null,
								schema,
							},
						]
					: []),
			],
			setPropStatuses,
			clientId: previewServerState.clientId,
			undoLabel: `Reset ${fieldLabel}`,
			redoLabel: `Reapply ${fieldLabel}`,
		});
	}, [
		canResetToDefault,
		canShowReset,
		field.description,
		field.fieldSchema.default,
		field.key,
		nodePath,
		previewServerState,
		propStatusesForOverride?.durationInFrames,
		schema,
		setPropStatuses,
		validatedLocation.source,
		propStatus,
	]);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		if (selection.selectable) {
			selection.onSelect({shiftKey: false, toggleKey: false});
		}

		return [
			getCopyContextForAgentsMenuItem({
				contextForAgents: formatContextForAgents({
					location: validatedLocation,
					name: `Property "${field.key}"`,
					root: window.remotion_cwd,
				}),
			}),
			{
				type: 'divider',
				id: 'copy-context-for-agents-divider',
			},
			{
				type: 'item',
				id: 'reset-sequence-field',
				keyHint: null,
				label: 'Reset',
				leftItem: null,
				disabled: !canShowReset,
				onClick: onReset,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'reset-sequence-field',
			},
		];
	}, [canShowReset, field.key, onReset, selection, validatedLocation]);

	const onPropertyDoubleClick = useCallback<
		React.MouseEventHandler<HTMLDivElement>
	>(
		(event) => {
			if (!canOpenInEditor || !defaultEditorId) {
				return;
			}

			event.stopPropagation();
			openOriginalPositionInEditorAtProperty({
				editorId: defaultEditorId,
				originalPosition: validatedLocation,
				property: field.key.split('.').at(-1) ?? field.key,
			}).catch(() => undefined);
		},
		[canOpenInEditor, defaultEditorId, field.key, validatedLocation],
	);

	if (propStatus === null) {
		return null;
	}

	const fieldValue = isKeyframedStatus(propStatus) ? (
		<TimelineSequenceKeyframedValue
			field={field}
			fileName={validatedLocation.source}
			nodePath={nodePath}
			schema={schema}
			propStatus={propStatus}
			keyframeDisplayOffset={keyframeDisplayOffset}
			keyframePlaybackRate={keyframePlaybackRate}
		/>
	) : propStatus.status === 'static' ? (
		<Value
			field={field}
			durationPropStatus={propStatusesForOverride?.durationInFrames ?? null}
			nodePath={nodePath}
			validatedLocation={validatedLocation}
			schema={schema}
			propStatus={propStatus}
		/>
	) : (
		<TimelineNonEditableStatus
			propStatus={propStatus}
			field={field}
			runtimeValue={runtimeValue}
			validatedLocation={validatedLocation}
		/>
	);

	if (field.typeName === 'asset' && field.key === 'src') {
		return (
			<div
				style={{
					...inlineSourceFieldRow,
					...(propStatus.status === 'computed' ? computedSourceFieldRow : null),
					...style,
				}}
			>
				{fieldValue}
			</div>
		);
	}

	const row = (
		<TimelineRowChrome
			depth={rowDepth}
			eye={<TimelineLayerEyeSpacer />}
			keyframeControls={keyframeControls}
			arrow={<TimelineExpandArrowSpacer />}
			style={style}
			selected={selection.selected}
			selectable={selection.selectable}
			onSelect={selection.onSelect}
			onDoubleClick={onPropertyDoubleClick}
			showSelectedBackground
			containsSelection={containsSelection}
			outerHeight={null}
		>
			{hidePathValue ? (
				<TimelineFieldLabel
					rowDepth={rowDepth}
					selected={selection.selected || containsSelection}
					label={field.description ?? field.key}
				/>
			) : (
				<TimelineFieldRowContent
					field={field}
					rowDepth={rowDepth}
					selected={selection.selected || containsSelection}
				>
					{fieldValue}
				</TimelineFieldRowContent>
			)}
		</TimelineRowChrome>
	);

	return <ContextMenu getItems={getContextMenuItems}>{row}</ContextMenu>;
};
