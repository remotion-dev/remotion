import {
	isSchemaFieldKeyframable,
	optimisticUpdateForEffectPropStatuses,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {EffectSchemaFieldInfo} from '../../helpers/timeline-layout';
import {ModalsContext} from '../../state/modals';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {callAddEffectKeyframe} from './call-add-keyframe';
import {getComputedStatusLabel} from './get-timeline-keyframes';
import {saveEffectProp} from './save-effect-prop';
import {enqueueSavePropChange} from './save-prop-queue';
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
import {TimelineFieldValue, UnsupportedStatus} from './TimelineSchemaField';
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

export const TimelineEffectPropValue: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly keyframeDisplayOffset: number;
	readonly sourceFrame?: number;
}> = ({
	field,
	nodePath,
	validatedLocation,
	keyframeDisplayOffset,
	sourceFrame,
}) => {
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
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const jsxFrame = sourceFrame ?? timelinePosition - keyframeDisplayOffset;

	const onDragValueChange = useCallback(
		(value: unknown) => {
			const nextDragOverrideValue =
				propStatus !== null && isKeyframedStatus(propStatus)
					? Internals.makeKeyframedDragOverride({
							status: propStatus,
							frame: jsxFrame,
							value,
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
			field.key,
			jsxFrame,
			nodePath,
			propStatus,
			setEffectDragOverrides,
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
			return <UnsupportedStatus label="computed" />;
		}

		if (effectStatus.reason === 'not-call-expression') {
			return <UnsupportedStatus label="not inline" />;
		}

		if (effectStatus.reason === 'not-found') {
			return <UnsupportedStatus label="not found in code" />;
		}

		throw new Error(
			`Unsupported effect status: ${effectStatus.reason satisfies never}`,
		);
	}

	if (effectStatus.type === 'cannot-update-sequence') {
		if (effectStatus.reason === 'not-found') {
			return <UnsupportedStatus label="not found in code" />;
		}

		if (effectStatus.reason === 'error') {
			return <UnsupportedStatus label="error" />;
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
				keyframeDisplayOffset={keyframeDisplayOffset}
				sourceFrame={jsxFrame}
				dragOverrideValue={dragOverrideValue}
				onSave={onSaveKeyframed}
				onDragValueChange={onDragValueChange}
				onDragEnd={onDragEnd}
				scaleLockNodePath={nodePath}
			/>
		);
	}

	if (propStatus.status === 'computed') {
		return <UnsupportedStatus label={getComputedStatusLabel(propStatus)} />;
	}

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		propStatus,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
		frame: jsxFrame,
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

export const TimelineEffectPropItem: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
	readonly keyframeControlsMode?: TimelineKeyframeControlsMode;
}> = ({
	field,
	validatedLocation,
	rowDepth,
	nodePath,
	nodePathInfo,
	keyframeDisplayOffset,
	keyframeControlsMode = 'timeline',
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(ModalsContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const selection = useTimelineRowSelection(nodePathInfo);
	const style = useMemo(() => {
		return {
			...fieldRowBase,
			height: field.rowHeight,
		};
	}, [field.rowHeight]);

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
			schema: field.effectSchema,
			effectIndex: field.effectIndex,
		});
	}, [
		field.description,
		field.effectIndex,
		field.effectSchema,
		field.key,
		nodePath,
		propStatus,
		setSelectedModal,
		validatedLocation.source,
	]);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		const values: ComboboxValue[] = [
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

		if (propStatus !== null && isKeyframedStatus(propStatus)) {
			values.push({
				type: 'item',
				id: 'keyframe-settings-effect-field',
				keyHint: null,
				label: 'Keyframe settings...',
				leftItem: null,
				disabled: previewServerState.type !== 'connected',
				onClick: onOpenKeyframeSettings,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'keyframe-settings-effect-field',
			});
		}

		return values;
	}, [
		canShowReset,
		onOpenKeyframeSettings,
		onReset,
		previewServerState,
		propStatus,
	]);

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
			showSelectedBackground
			containsSelection={false}
			outerHeight={null}
		>
			<TimelineFieldLabel
				rowDepth={rowDepth}
				selected={selection.selected}
				label={field.description ?? field.key}
			/>
			<div style={timelineFieldValueColumnStyle}>
				<TimelineEffectPropValue
					field={field}
					nodePath={nodePath}
					validatedLocation={validatedLocation}
					keyframeDisplayOffset={keyframeDisplayOffset}
				/>
			</div>
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
