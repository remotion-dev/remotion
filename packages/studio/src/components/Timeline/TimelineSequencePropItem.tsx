import {isSchemaFieldKeyframable} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	InteractivitySchema,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {ModalsContext} from '../../state/modals';
import {ContextMenu} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {callAddSequenceKeyframe} from './call-add-keyframe';
import {getAnimationItemSelectionForSourceFrame} from './get-animation-item-selection-for-frame';
import {saveSequenceProps} from './save-sequence-prop';
import {timelineFieldValueColumnStyle} from './timeline-field-row-layout';
import {TimelineExpandArrowSpacer} from './TimelineExpandArrowButton';
import {TimelineFieldLabel} from './TimelineFieldLabel';
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
	useTimelineRowSelection,
	useTimelineSelection,
} from './TimelineSelection';
import {canEditEasingForInterpolationFunction} from './update-selected-easing';

const fieldRowBase: React.CSSProperties = {};

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

const Value: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly schema: InteractivitySchema;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
}> = ({field, nodePath, validatedLocation, schema, propStatus}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
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

			if (value === propStatus.codeValue) {
				return Promise.resolve();
			}

			if (
				defaultValue === stringifiedValue &&
				propStatus.codeValue === undefined
			) {
				return Promise.resolve();
			}

			return saveSequenceProps({
				changes: [
					{
						fileName: validatedLocation.source,
						nodePath,
						fieldKey: field.key,
						value,
						defaultValue,
						schema,
						sourceEdit: options?.sourceEdit,
					},
				],
				setPropStatuses,
				clientId,
				undoLabel: `Update ${fieldLabel}`,
				redoLabel: `Update ${fieldLabel} again`,
			});
		},
		[
			propStatus,
			clientId,
			field.description,
			field.fieldSchema.default,
			field.fieldSchema.type,
			field.key,
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

			setDragOverrides(
				nodePath,
				field.key,
				Internals.makeStaticDragOverride(value),
			);
		},
		[setDragOverrides, nodePath, field.key],
	);

	const onDragEnd = useCallback(() => {
		if (nodePath === null) {
			throw new Error('Cannot clear drag value');
		}

		clearDragOverrides(nodePath);
	}, [clearDragOverrides, nodePath]);

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

export const TimelineSequenceKeyframedValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly sourceFrame: number;
}> = ({field, fileName, nodePath, schema, propStatus, sourceFrame}) => {
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

	const onKeyframedDragValueChange =
		useCallback<TimelineFieldOnDragValueChange>(
			(value) => {
				setDragOverrides(
					nodePath,
					field.key,
					Internals.makeKeyframedDragOverride({
						status: propStatus,
						frame: sourceFrame,
						value,
					}),
				);
			},
			[propStatus, field.key, nodePath, setDragOverrides, sourceFrame],
		);

	const onKeyframedDragEnd = useCallback(() => {
		clearDragOverrides(nodePath);
	}, [clearDragOverrides, nodePath]);

	return (
		<TimelineKeyframedValue
			field={field}
			propStatus={propStatus}
			sourceFrame={sourceFrame}
			dragOverrideValue={dragOverrideValue}
			onSave={onSaveKeyframed}
			onDragValueChange={onKeyframedDragValueChange}
			onDragEnd={onKeyframedDragEnd}
			scaleLockNodePath={nodePath}
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
	readonly keyframeControlsMode?: TimelineKeyframeControlsMode;
}> = ({
	field,
	validatedLocation,
	rowDepth,
	nodePath,
	nodePathInfo,
	schema,
	keyframeDisplayOffset,
	keyframeControlsMode = 'timeline',
}) => {
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(ModalsContext);
	const selection = useTimelineRowSelection(nodePathInfo);
	const {selectItems} = useTimelineSelection();
	const setFrame = Internals.useTimelineSetFrame();
	const videoConfig = useVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const sourceFrame = timelinePosition - keyframeDisplayOffset;

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
				defaultValue={field.fieldSchema.default}
				dragOverrideValue={dragOverrideValue}
				schema={schema}
				effectIndex={null}
				nodePathInfo={nodePathInfo}
				mode={keyframeControlsMode}
			/>
		) : null;

	const style = useMemo(() => {
		return {
			...fieldRowBase,
			height: field.rowHeight,
		};
	}, [field.rowHeight]);

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

		saveSequenceProps({
			changes: [
				{
					fileName: validatedLocation.source,
					nodePath,
					fieldKey: field.key,
					value: field.fieldSchema.default,
					defaultValue,
					schema,
				},
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
		schema,
		setPropStatuses,
		validatedLocation.source,
		propStatus,
	]);

	const onOpenKeyframeSettings = useCallback(() => {
		if (propStatus === null || !isKeyframedStatus(propStatus)) {
			return;
		}

		setSelectedModal({
			type: 'keyframe-settings',
			fileName: validatedLocation.source,
			nodePath,
			fieldKey: field.key,
			fieldLabel: field.description ?? field.key,
			status: propStatus,
			schema,
			effectIndex: null,
		});
	}, [
		propStatus,
		field.description,
		field.key,
		nodePath,
		schema,
		setSelectedModal,
		validatedLocation.source,
	]);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		const values: ComboboxValue[] = [
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

		if (propStatus !== null && isKeyframedStatus(propStatus)) {
			values.push({
				type: 'item',
				id: 'keyframe-settings-sequence-field',
				keyHint: null,
				label: 'Keyframe settings...',
				leftItem: null,
				disabled: previewServerState.type !== 'connected',
				onClick: onOpenKeyframeSettings,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'keyframe-settings-sequence-field',
			});
		}

		return values;
	}, [
		canShowReset,
		propStatus,
		onOpenKeyframeSettings,
		onReset,
		previewServerState,
	]);

	const seekToDisplayFrame = useCallback(
		(frame: number) => {
			setFrame((current) => {
				const next = {...current, [videoConfig.id]: frame};
				Internals.persistCurrentFrame(next);
				return next;
			});
		},
		[setFrame, videoConfig.id],
	);

	const onPropertyDoubleClick = useCallback<
		React.MouseEventHandler<HTMLDivElement>
	>(
		(event) => {
			if (propStatus === null || propStatus.status === 'computed') {
				return;
			}

			const keyframeSelection = {
				type: 'keyframe' as const,
				nodePathInfo,
				frame: sourceFrame + keyframeDisplayOffset,
			};

			if (propStatus.status === 'static') {
				if (!keyframable || previewServerState.type !== 'connected') {
					return;
				}

				const value = Internals.getEffectiveVisualModeValue({
					propStatus,
					dragOverrideValue,
					frame: sourceFrame,
					defaultValue: field.fieldSchema.default,
					shouldResortToDefaultValueIfUndefined: true,
				});

				event.stopPropagation();
				callAddSequenceKeyframe({
					fileName: validatedLocation.source,
					nodePath,
					fieldKey: field.key,
					sourceFrame,
					value,
					schema,
					setPropStatuses,
					clientId: previewServerState.clientId,
				}).catch(() => undefined);
				selectItems([keyframeSelection], {reveal: true});
				seekToDisplayFrame(keyframeSelection.frame);
				return;
			}

			const targetSelection = getAnimationItemSelectionForSourceFrame({
				includeEasings: canEditEasingForInterpolationFunction(
					propStatus.interpolationFunction,
				),
				keyframeDisplayOffset,
				keyframes: propStatus.keyframes,
				nodePathInfo,
				sourceFrame,
			});

			if (targetSelection === null) {
				return;
			}

			event.stopPropagation();
			selectItems([targetSelection], {reveal: true});
			if (targetSelection.type === 'keyframe') {
				seekToDisplayFrame(targetSelection.frame);
			}
		},
		[
			dragOverrideValue,
			field.fieldSchema.default,
			field.key,
			keyframeDisplayOffset,
			keyframable,
			nodePath,
			nodePathInfo,
			previewServerState,
			propStatus,
			schema,
			seekToDisplayFrame,
			selectItems,
			setPropStatuses,
			sourceFrame,
			validatedLocation.source,
		],
	);

	if (propStatus === null) {
		return null;
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
			selectionItem={selection.selectionItem}
			onSelect={selection.onSelect}
			onDoubleClick={onPropertyDoubleClick}
			showSelectedBackground
			containsSelection={false}
			outerHeight={null}
		>
			<TimelineFieldLabel
				rowDepth={rowDepth}
				selected={selection.selected}
				label={field.description ?? field.key}
			/>
			{isKeyframedStatus(propStatus) ? (
				<div style={timelineFieldValueColumnStyle}>
					<TimelineSequenceKeyframedValue
						field={field}
						fileName={validatedLocation.source}
						nodePath={nodePath}
						schema={schema}
						propStatus={propStatus}
						sourceFrame={sourceFrame}
					/>
				</div>
			) : propStatus.status === 'static' ? (
				<div style={timelineFieldValueColumnStyle}>
					<Value
						field={field}
						nodePath={nodePath}
						validatedLocation={validatedLocation}
						schema={schema}
						propStatus={propStatus}
					/>
				</div>
			) : (
				<div style={timelineFieldValueColumnStyle}>
					<TimelineNonEditableStatus propStatus={propStatus} />
				</div>
			)}
		</TimelineRowChrome>
	);

	return (
		<ContextMenu
			values={contextMenuValues}
			onOpen={selection.selectable ? selection.onSelect : null}
		>
			{row}
		</ContextMenu>
	);
};
