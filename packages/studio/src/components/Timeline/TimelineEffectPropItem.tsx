import {
	isSchemaFieldHoldOnly,
	isSchemaFieldKeyframable,
	optimisticUpdateForEffectPropStatuses,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusKeyframed,
	RuntimeValueStore,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {openOriginalPositionInEditorAtProperty} from '../../helpers/open-in-editor';
import type {EffectSchemaFieldInfo} from '../../helpers/timeline-layout';
import {useRuntimeStoreValue} from '../../helpers/use-runtime-values';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {useEditorOpening} from '../use-default-editor-info';
import {callAddEffectKeyframe} from './call-add-keyframe';
import {getKeyframeDisplayOffset} from './get-timeline-keyframes';
import {saveEffectProp} from './save-effect-prop';
import {enqueueSavePropChange} from './save-prop-queue';
import {TimelineExpandArrowSpacer} from './TimelineExpandArrowButton';
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
	TIMELINE_COMPUTED_EFFECT_FIX_LINK,
	TimelineFieldValue,
	TimelineNonEditableStatus,
	UnsupportedStatus,
} from './TimelineSchemaField';
import {useTimelineRowSelection} from './TimelineSelection';

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

const TimelineComputedEffectPropValue: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusFalse;
	readonly runtimeValueStore: RuntimeValueStore | null;
}> = ({field, propStatus, runtimeValueStore}) => {
	const runtimeValue = useRuntimeStoreValue(runtimeValueStore, field.key);

	return (
		<TimelineNonEditableStatus
			propStatus={propStatus}
			field={field}
			runtimeValue={runtimeValue}
			fixHref={TIMELINE_COMPUTED_EFFECT_FIX_LINK}
		/>
	);
};

export const TimelineEffectPropValue: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly sourceFrame: number;
	readonly runtimeValueStore: RuntimeValueStore | null;
}> = ({field, nodePath, validatedLocation, sourceFrame, runtimeValueStore}) => {
	const {setEffectDragOverrides, clearEffectDragOverrides, setPropStatuses} =
		useContext(Internals.VisualModeSettersContext);

	const {getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);

	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);

	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses: visualModePropStatuses,
		nodePath,
		effectIndex: field.effectIndex,
	});

	const propStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.[field.key] ?? null)
			: null;

	const onDragValueChange = useCallback(
		(value: unknown) => {
			const nextDragOverrideValue =
				propStatus !== null && isKeyframedStatus(propStatus)
					? Internals.makeKeyframedDragOverride({
							status: propStatus,
							frame: sourceFrame,
							value,
							defaultEasing: isSchemaFieldHoldOnly({
								schema: field.effectSchema,
								key: field.key,
							})
								? {type: 'step1'}
								: undefined,
						})
					: Internals.makeStaticDragOverride(value);

			setEffectDragOverrides(
				nodePath,
				field.effectIndex,
				field.key,
				nextDragOverrideValue,
			);
		},
		[
			field.effectIndex,
			field.effectSchema,
			field.key,
			nodePath,
			propStatus,
			setEffectDragOverrides,
			sourceFrame,
		],
	);

	const onDragEnd = useCallback(() => {
		clearEffectDragOverrides(nodePath, field.effectIndex);
	}, [clearEffectDragOverrides, nodePath, field.effectIndex]);

	const dragOverrideValue = useMemo(() => {
		const overrides = getEffectDragOverrides(nodePath, field.effectIndex);
		return overrides[field.key];
	}, [getEffectDragOverrides, nodePath, field.effectIndex, field.key]);

	const onSave = useCallback(
		(value: unknown) => {
			if (!validatedLocation) {
				return Promise.reject(new Error('Cannot save'));
			}

			if (!propStatus) {
				return Promise.reject(new Error('Cannot save'));
			}

			if (propStatus.status !== 'static') {
				return Promise.reject(new Error('Cannot save'));
			}

			if (!clientId) {
				return Promise.reject(new Error('Not connected to studio server'));
			}

			const defaultValue =
				field.fieldSchema.default !== undefined
					? JSON.stringify(field.fieldSchema.default)
					: null;

			const stringifiedValue = JSON.stringify(value);

			if (value === propStatus.codeValue) {
				return Promise.resolve();
			}

			if (
				defaultValue === stringifiedValue &&
				propStatus.codeValue === undefined
			) {
				return Promise.resolve();
			}

			return enqueueSavePropChange({
				nodePath,
				setPropStatuses,
				applyOptimistic: (prev) =>
					optimisticUpdateForEffectPropStatuses({
						previous: prev,
						effectIndex: field.effectIndex,
						fieldKey: field.key,
						value,
						schema: field.effectSchema,
					}),
				apiCall: () =>
					callApi('/api/save-effect-props', {
						type: 'value',
						fileName: validatedLocation.source,
						sequenceNodePath: nodePath,
						effectIndex: field.effectIndex,
						key: field.key,
						value: stringifiedValue,
						defaultValue,
						schema: field.effectSchema,
						clientId,
					}),
				errorLabel: 'Could not save effect prop',
			});
		},
		[
			clientId,
			field.effectIndex,
			field.effectSchema,
			field.fieldSchema.default,
			field.key,
			nodePath,
			propStatus,
			setPropStatuses,
			validatedLocation,
		],
	);

	const onSaveKeyframed = useCallback(
		(value: unknown, frame: number) => {
			if (!validatedLocation) {
				return Promise.reject(new Error('Cannot save'));
			}

			if (!clientId) {
				return Promise.reject(new Error('Not connected to studio server'));
			}

			return callAddEffectKeyframe({
				fileName: validatedLocation.source,
				nodePath,
				effectIndex: field.effectIndex,
				fieldKey: field.key,
				sourceFrame: frame,
				value,
				schema: field.effectSchema,
				setPropStatuses,
				clientId,
			});
		},
		[
			clientId,
			field.effectIndex,
			field.effectSchema,
			field.key,
			nodePath,
			setPropStatuses,
			validatedLocation,
		],
	);

	if (field.fieldSchema.type === 'scale') {
		throw new Error(`Effects do not support scale fields: ${field.key}`);
	}

	if (effectStatus.type === 'cannot-update-effect') {
		if (effectStatus.reason === 'computed') {
			return (
				<TimelineComputedEffectPropValue
					propStatus={{status: 'computed'}}
					field={field}
					runtimeValueStore={runtimeValueStore}
				/>
			);
		}

		if (effectStatus.reason === 'not-call-expression') {
			return <UnsupportedStatus label="not inline" formattedValue={false} />;
		}

		if (effectStatus.reason === 'not-found') {
			return (
				<UnsupportedStatus label="not found in code" formattedValue={false} />
			);
		}

		throw new Error(
			`Unsupported effect status: ${effectStatus.reason satisfies never}`,
		);
	}

	if (effectStatus.type === 'cannot-update-sequence') {
		if (effectStatus.reason === 'not-found') {
			return (
				<UnsupportedStatus label="not found in code" formattedValue={false} />
			);
		}

		if (effectStatus.reason === 'error') {
			return <UnsupportedStatus label="error" formattedValue={false} />;
		}

		throw new Error(
			`Unsupported effect status: ${effectStatus.reason satisfies never}`,
		);
	}

	if (propStatus === null) {
		return null;
	}

	if (isKeyframedStatus(propStatus)) {
		return (
			<TimelineKeyframedValue
				field={field}
				propStatus={propStatus}
				sourceFrame={sourceFrame}
				dragOverrideValue={dragOverrideValue}
				onSave={onSaveKeyframed}
				onDragValueChange={onDragValueChange}
				onDragEnd={onDragEnd}
				scaleLockNodePath={nodePath}
			/>
		);
	}

	if (propStatus.status === 'computed') {
		return (
			<TimelineComputedEffectPropValue
				propStatus={propStatus}
				field={field}
				runtimeValueStore={runtimeValueStore}
			/>
		);
	}

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		propStatus,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
		frame: sourceFrame,
		shouldResortToDefaultValueIfUndefined: true,
	});

	return (
		<TimelineFieldValue
			field={field}
			propStatus={propStatus}
			onSave={onSave}
			onDragValueChange={onDragValueChange}
			onDragEnd={onDragEnd}
			effectiveValue={effectiveValue}
			scaleLockNodePath={null}
		/>
	);
};

const TimelineEffectPropValueAtCurrentFrame: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly keyframeDisplayOffset: number;
	readonly runtimeValueStore: RuntimeValueStore | null;
}> = ({
	field,
	nodePath,
	validatedLocation,
	keyframeDisplayOffset,
	runtimeValueStore,
}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();

	return (
		<TimelineEffectPropValue
			field={field}
			nodePath={nodePath}
			validatedLocation={validatedLocation}
			sourceFrame={timelinePosition - keyframeDisplayOffset}
			runtimeValueStore={runtimeValueStore}
		/>
	);
};

export const TimelineEffectPropItem: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
	readonly keyframeControlsMode: TimelineKeyframeControlsMode;
	readonly runtimeValueStore: RuntimeValueStore | null;
}> = ({
	field,
	validatedLocation,
	rowDepth,
	nodePath,
	nodePathInfo,
	keyframeDisplayOffset,
	keyframeControlsMode,
	runtimeValueStore,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canOpenInEditor, defaultEditorId} = useEditorOpening(
		previewServerState.type === 'connected',
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const selection = useTimelineRowSelection(nodePathInfo);
	const style = useMemo((): React.CSSProperties => {
		return field.typeName === 'text-content'
			? fieldRowBase
			: {...fieldRowBase, height: field.rowHeight};
	}, [field.rowHeight, field.typeName]);

	const effectStatus = useMemo(
		() =>
			Internals.getEffectPropStatusesCtx({
				propStatuses,
				nodePath,
				effectIndex: field.effectIndex,
			}),
		[propStatuses, nodePath, field.effectIndex],
	);

	const propStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.[field.key] ?? null)
			: null;
	const resolvedKeyframeDisplayOffset = getKeyframeDisplayOffset({
		propStatus,
		keyframeDisplayOffset,
	});

	const dragOverrideValue = useMemo(() => {
		const overrides = getEffectDragOverrides(nodePath, field.effectIndex);
		return overrides[field.key];
	}, [getEffectDragOverrides, nodePath, field.effectIndex, field.key]);

	const keyframable = isSchemaFieldKeyframable({
		schema: field.effectSchema,
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
				schema={field.effectSchema}
				effectIndex={field.effectIndex}
				nodePathInfo={nodePathInfo}
				mode={keyframeControlsMode}
			/>
		) : null;

	const canResetToDefault = useMemo(() => {
		if (!propStatus || propStatus.status === 'computed') {
			return false;
		}

		return isResettableStatus({
			status: propStatus,
			defaultValue: field.fieldSchema.default,
		});
	}, [field.fieldSchema.default, propStatus]);

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
			previewServerState.type !== 'connected'
		) {
			return;
		}

		const defaultValue =
			field.fieldSchema.default !== undefined
				? JSON.stringify(field.fieldSchema.default)
				: null;

		saveEffectProp({
			type: 'value',
			fileName: validatedLocation.source,
			nodePath,
			effectIndex: field.effectIndex,
			fieldKey: field.key,
			value: field.fieldSchema.default,
			defaultValue,
			schema: field.effectSchema,
			setPropStatuses,
			clientId: previewServerState.clientId,
		});
	}, [
		canResetToDefault,
		canShowReset,
		field.effectIndex,
		field.effectSchema,
		field.fieldSchema.default,
		field.key,
		nodePath,
		previewServerState,
		setPropStatuses,
		validatedLocation.source,
	]);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		if (selection.selectable) {
			selection.onSelect({shiftKey: false, toggleKey: false});
		}

		return [
			{
				type: 'item',
				id: 'reset-effect-field',
				keyHint: null,
				label: 'Reset',
				leftItem: null,
				disabled: !canShowReset,
				onClick: onReset,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'reset-effect-field',
			},
		];
	}, [canShowReset, onReset, selection]);

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
				property: field.key,
			}).catch(() => undefined);
		},
		[canOpenInEditor, defaultEditorId, field.key, validatedLocation],
	);

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
			isFieldRow
			outerHeight={null}
		>
			<TimelineFieldRowContent
				field={field}
				rowDepth={rowDepth}
				selected={selection.selected}
				keyframeControls={keyframeControls}
			>
				<TimelineEffectPropValueAtCurrentFrame
					field={field}
					nodePath={nodePath}
					validatedLocation={validatedLocation}
					keyframeDisplayOffset={resolvedKeyframeDisplayOffset}
					runtimeValueStore={runtimeValueStore}
				/>
			</TimelineFieldRowContent>
		</TimelineRowChrome>
	);

	return <ContextMenu getItems={getContextMenuItems}>{row}</ContextMenu>;
};
