import {
	isSchemaFieldHoldOnly,
	isSchemaFieldKeyframable,
	stringifySequenceSubscriptionKey,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	InteractivitySchema,
	RuntimeValueStore,
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
	TimelineFieldOnDragEnd,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {useRuntimeStoreValue} from '../../helpers/use-runtime-values';
import {ContextMenu} from '../ContextMenu';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {useEditorOpening} from '../use-default-editor-info';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';
import {getSequencePropResetChanges} from './get-sequence-prop-reset-changes';
import {
	getKeyframeDisplayOffset,
	getKeyframeSourceFrame,
} from './get-timeline-keyframes';
import {saveSequencePropsWithResult} from './save-sequence-prop';
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
import {useClampSequenceTimingValue} from './use-clamp-sequence-timing-value';
import {usePlaybackRatePreview} from './use-playback-rate-preview';
import {useSequencePropPreview} from './use-sequence-prop-preview';

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
	fieldKey,
}: {
	readonly status: CanUpdateSequencePropStatus;
	readonly defaultValue: unknown;
	readonly fieldKey: string;
}) => {
	if (defaultValue === undefined) {
		return (
			fieldKey === 'premountFor' &&
			status.status === 'static' &&
			status.codeValue !== undefined
		);
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

const Value: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly schema: InteractivitySchema;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
}> = ({field, nodePath, validatedLocation, schema, propStatus}) => {
	const defaultPremountInSeconds = useContext(Internals.DefaultPremountContext);
	const video = Internals.useVideo();
	const fps = nodePath.videoConfigValues?.fps ?? video?.fps;
	const {clampTimingValue, clearTimingLimits} = useClampSequenceTimingValue();
	const {getPreview, takePreview, cancelPreview} = useSequencePropPreview();
	const {
		preview: previewPlaybackRate,
		take: takePlaybackRatePreview,
		cancel: cancelPlaybackRatePreview,
	} = usePlaybackRatePreview({field, nodePath});
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);

	// Items without an intrinsic duration need a finite loop range. Filling it
	// with the current end keeps the output unchanged until the clip is extended.
	const getLoopDurationChange = useCallback(
		(value: unknown): number | null => {
			if (field.key !== 'loop' || value !== true || !schema.durationInFrames) {
				return null;
			}

			const durationStatus = Internals.getPropStatusesCtx(
				propStatusesRef.current,
				nodePath,
			)?.durationInFrames;
			if (
				durationStatus?.status !== 'static' ||
				durationStatus.codeValue !== undefined
			) {
				return null;
			}

			const key = stringifySequenceSubscriptionKey(nodePath);
			const overrideIdToNodePathMappings =
				overrideIdToNodePathMappingsRef.current;
			const sequence = sequencesRef.current.find((candidate) => {
				const overrideId = candidate.controls?.overrideId;
				const path = overrideId
					? overrideIdToNodePathMappings[overrideId]
					: undefined;
				return path && stringifySequenceSubscriptionKey(path) === key;
			});
			if (
				!sequence ||
				sequence.type === 'audio' ||
				sequence.type === 'video' ||
				!Number.isFinite(sequence.duration) ||
				sequence.duration <= 0
			) {
				return null;
			}

			return sequence.duration * sequence.sequencePlaybackRate;
		},
		[
			field.key,
			nodePath,
			overrideIdToNodePathMappingsRef,
			propStatusesRef,
			schema,
			sequencesRef,
		],
	);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);

	const dragOverrideValue = useMemo(() => {
		return nodePath === null
			? undefined
			: (getDragOverrides(nodePath) ?? {})[field.key];
	}, [getDragOverrides, nodePath, field.key]);

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		propStatus,
		dragOverrideValue,
		defaultValue:
			field.key === 'premountFor' &&
			field.fieldSchema.default === undefined &&
			fps !== undefined
				? Math.round(defaultPremountInSeconds * fps)
				: field.fieldSchema.default,
		shouldResortToDefaultValueIfUndefined: true,
	});

	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const cancelActivePreview = useCallback(() => {
		clearTimingLimits();
		if (nodePath === null) {
			throw new Error('Cannot clear drag value');
		}

		cancelPreview();
		cancelPlaybackRatePreview();
	}, [cancelPreview, cancelPlaybackRatePreview, nodePath, clearTimingLimits]);

	const onSave = useCallback<TimelineFieldOnSave>(
		(value, options) => {
			value = clampTimingValue(nodePath, field.key, value);
			clearTimingLimits();
			if (!clientId) {
				cancelActivePreview();
				return Promise.reject(new Error('Not connected to studio server'));
			}

			const defaultValue =
				field.fieldSchema.type === 'string' ||
				field.fieldSchema.type === 'text-content'
					? null
					: field.fieldSchema.default !== undefined
						? JSON.stringify(field.fieldSchema.default)
						: null;

			const stringifiedValue = JSON.stringify(value);
			const fieldLabel = field.description ?? field.key;
			const loopDurationChange = getLoopDurationChange(value);

			if (value === propStatus.codeValue) {
				cancelActivePreview();
				return Promise.resolve();
			}

			if (
				defaultValue === stringifiedValue &&
				propStatus.codeValue === undefined
			) {
				cancelActivePreview();
				return Promise.resolve();
			}

			const preview = takePreview();
			const retiming = takePlaybackRatePreview(value);
			if (retiming === null) {
				preview.cancel();
				return Promise.resolve();
			}

			const retimingPreview = retiming.preview;

			const currentNodePath = preview.getNodePath(nodePath);
			if (currentNodePath === null) {
				preview.cancel();
				retimingPreview.cancel();
				return Promise.resolve();
			}

			const preparesSource =
				options?.sourceEdit?.type === 'google-font' ||
				options?.sourceEdit?.type === 'clipboard-param';
			if (!preparesSource) {
				preview.setDragOverrides(
					nodePath,
					field.key,
					Internals.makeStaticDragOverride(value),
				);
				if (loopDurationChange !== null)
					preview.setDragOverrides(
						nodePath,
						'durationInFrames',
						Internals.makeStaticDragOverride(loopDurationChange),
					);
			}

			return unstable_batchedUpdates(() => {
				// The rate and its retimed animations must share the same optimistic
				// generation before another edit derives its relative timing.
				retiming.commit();
				return saveSequencePropsWithResult({
					addedKeyframes: null,
					movedKeyframes: null,
					changes: [
						{
							fileName: validatedLocation.source,
							nodePath: currentNodePath,
							fieldKey: field.key,
							value,
							defaultValue,
							schema,
							sourceEdit:
								field.key === 'playbackRate'
									? {type: 'playback-rate'}
									: options?.sourceEdit,
						},
						...(loopDurationChange === null
							? []
							: [
									{
										fileName: validatedLocation.source,
										nodePath: currentNodePath,
										fieldKey: 'durationInFrames',
										value: loopDurationChange,
										defaultValue: null,
										schema,
									},
								]),
					],
					setPropStatuses: preparesSource
						? setPropStatuses
						: preview.setPropStatuses,
					clientId,
					undoLabel: `Update ${fieldLabel}`,
					redoLabel: `Update ${fieldLabel} again`,
				});
			})
				.then((response) => {
					if (response && !response.canUpdate)
						throw new Error(
							'The layer could not be updated. Try the edit again.',
						);
					preview.acknowledge(response);
					retimingPreview.acknowledge(response);
				})
				.catch((error) => {
					preview.fail();
					retimingPreview.fail();
					showNotification(
						`Could not update ${fieldLabel}: ${error instanceof Error ? error.message : String(error)}`,
						4000,
					);
				});
		},
		[
			clampTimingValue,
			clearTimingLimits,
			cancelActivePreview,
			takePreview,
			takePlaybackRatePreview,
			propStatus,
			clientId,
			field.description,
			field.fieldSchema.default,
			field.fieldSchema.type,
			field.key,
			getLoopDurationChange,
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

			value = clampTimingValue(nodePath, field.key, value);
			unstable_batchedUpdates(() => {
				previewPlaybackRate(value);
				getPreview().setDragOverrides(
					nodePath,
					field.key,
					Internals.makeStaticDragOverride(value),
				);
			});
		},
		[previewPlaybackRate, getPreview, nodePath, field.key, clampTimingValue],
	);

	const onDragEnd = useCallback<TimelineFieldOnDragEnd>(
		(reason) => {
			if (reason === 'cancel') cancelActivePreview();
		},
		[cancelActivePreview],
	);

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
	readonly onDragEnd: TimelineFieldOnDragEnd;
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
	const {getPreview, takePreview, cancelPreview} = useSequencePropPreview();
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
				cancelPreview();
				return Promise.reject(new Error('Not connected to studio server'));
			}

			const preview = takePreview();
			const currentNodePath = preview.getNodePath(nodePath);
			if (currentNodePath === null) {
				preview.cancel();
				return Promise.resolve();
			}

			preview.setDragOverrides(
				nodePath,
				field.key,
				Internals.makeKeyframedDragOverride({
					status: propStatus,
					frame,
					value,
					defaultEasing: isSchemaFieldHoldOnly({schema, key: field.key})
						? {type: 'step1'}
						: undefined,
				}),
			);
			return saveSequencePropsWithResult({
				changes: [],
				addedKeyframes: [
					{
						fileName,
						nodePath: currentNodePath,
						fieldKey: field.key,
						sourceFrame: frame,
						value,
						schema,
					},
				],
				movedKeyframes: null,
				setPropStatuses: preview.setPropStatuses,
				clientId,
				undoLabel: `Update ${field.description ?? field.key}`,
				redoLabel: `Update ${field.description ?? field.key} again`,
			})
				.then((response) => {
					if (response && !response.canUpdate)
						throw new Error(
							'The layer could not be updated. Try the edit again.',
						);
					preview.acknowledge(response);
				})
				.catch((error) => {
					preview.fail();
					showNotification(
						`Could not update ${field.description ?? field.key}: ${error instanceof Error ? error.message : String(error)}`,
						4000,
					);
				});
		},
		[
			clientId,
			field.description,
			field.key,
			fileName,
			nodePath,
			schema,
			propStatus,
			takePreview,
			cancelPreview,
		],
	);

	const onKeyframedDragValueChangeAtFrame = useCallback(
		(value: unknown, sourceFrame: number) => {
			getPreview().setDragOverrides(
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
		[propStatus, field.key, nodePath, schema, getPreview],
	);

	const onKeyframedDragEnd = useCallback<TimelineFieldOnDragEnd>(
		(reason) => {
			if (reason === 'cancel') cancelPreview();
		},
		[cancelPreview],
	);

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

const TimelineComputedSequencePropValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusFalse;
	readonly runtimeValueStore: RuntimeValueStore | null;
	readonly validatedLocation: CodePosition;
}> = ({field, propStatus, runtimeValueStore, validatedLocation}) => {
	const runtimeValue = useRuntimeStoreValue(runtimeValueStore, field.key);

	return (
		<TimelineNonEditableStatus
			propStatus={propStatus}
			field={field}
			runtimeValue={runtimeValue}
			validatedLocation={validatedLocation}
		/>
	);
};

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
	readonly runtimeValueStore: RuntimeValueStore | null;
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
	runtimeValueStore,
}) => {
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);

	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {takePreview: takeResetPreview} = useSequencePropPreview();
	const {take: takeResetRetimingPreview} = usePlaybackRatePreview({
		field,
		nodePath,
	});
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

	const keyframable =
		!(propStatus?.status === 'static' && propStatus.canKeyframe === false) &&
		isSchemaFieldKeyframable({
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
			fieldKey: field.key,
		});
	}, [propStatus, field.fieldSchema.default, field.key]);

	const canPerformReset =
		previewServerState.type === 'connected' &&
		propStatus !== null &&
		propStatus.status !== 'computed';
	const canShowReset =
		canPerformReset &&
		(field.fieldSchema.default !== undefined || field.key === 'premountFor');

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

		const changes = [
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
		];
		const preview = takeResetPreview();
		const retiming = takeResetRetimingPreview(field.fieldSchema.default);
		if (retiming === null) {
			preview.cancel();
			return;
		}

		for (const change of changes)
			preview.setDragOverrides(
				change.nodePath,
				change.fieldKey,
				Internals.makeStaticDragOverride(change.value),
			);
		unstable_batchedUpdates(() => {
			retiming.commit();
			return saveSequencePropsWithResult({
				addedKeyframes: null,
				movedKeyframes: null,
				changes,
				setPropStatuses: preview.setPropStatuses,
				clientId: previewServerState.clientId,
				undoLabel: `Reset ${fieldLabel}`,
				redoLabel: `Reapply ${fieldLabel}`,
			});
		})
			.then((response) => {
				if (response && !response.canUpdate)
					throw new Error(
						'The layer could not be updated. Try the edit again.',
					);
				preview.acknowledge(response);
				retiming.preview.acknowledge(response);
			})
			.catch((error) => {
				preview.fail();
				retiming.preview.fail();
				showNotification(
					`Could not reset ${fieldLabel}: ${error instanceof Error ? error.message : String(error)}`,
					4000,
				);
			});
	}, [
		canResetToDefault,
		canShowReset,
		field.description,
		field.fieldSchema.default,
		field.key,
		nodePath,
		previewServerState,
		schema,
		takeResetPreview,
		takeResetRetimingPreview,
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
			nodePath={nodePath}
			validatedLocation={validatedLocation}
			schema={schema}
			propStatus={propStatus}
		/>
	) : (
		<TimelineComputedSequencePropValue
			propStatus={propStatus}
			field={field}
			runtimeValueStore={runtimeValueStore}
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
			showBottomBorder={false}
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
