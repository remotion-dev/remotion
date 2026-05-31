import {optimisticUpdateForEffectCodeValues} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {EffectSchemaFieldInfo} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {getComputedStatusLabel} from './get-timeline-keyframes';
import {saveEffectProp} from './save-effect-prop';
import {enqueueSavePropChange} from './save-prop-queue';
import {timelineFieldValueColumnStyle} from './timeline-field-row-layout';
import {TimelineExpandArrowSpacer} from './TimelineExpandArrowButton';
import {TimelineFieldLabel} from './TimelineFieldLabel';
import {
	shouldShowTimelineKeyframeControls,
	TimelineKeyframeControls,
} from './TimelineKeyframeControls';
import {TimelineKeyframedValue} from './TimelineKeyframedValue';
import {TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {TimelineFieldValue, UnsupportedStatus} from './TimelineSchemaField';
import {useTimelineRowSelection} from './TimelineSelection';

const fieldRowBase: React.CSSProperties = {};

const Value: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly keyframeDisplayOffset: number;
}> = ({field, nodePath, validatedLocation, keyframeDisplayOffset}) => {
	const {setEffectDragOverrides, clearEffectDragOverrides, setCodeValues} =
		useContext(Internals.VisualModeSettersContext);

	const {getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);

	const {codeValues: visualModeCodeValues} = useContext(
		Internals.VisualModeCodeValuesContext,
	);

	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const effectStatus = Internals.getEffectCodeValuesCtx({
		codeValues: visualModeCodeValues,
		nodePath,
		effectIndex: field.effectIndex,
	});

	const propStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.[field.key] ?? null)
			: null;

	const onDragValueChange = useCallback(
		(value: unknown) => {
			setEffectDragOverrides(nodePath, field.effectIndex, field.key, value);
		},
		[setEffectDragOverrides, nodePath, field.effectIndex, field.key],
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

			if (!propStatus.canUpdate) {
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
				setCodeValues,
				applyOptimistic: (prev) =>
					optimisticUpdateForEffectCodeValues({
						previous: prev,
						effectIndex: field.effectIndex,
						fieldKey: field.key,
						value,
						schema: field.effectSchema,
					}),
				apiCall: () =>
					callApi('/api/save-effect-props', {
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
			setCodeValues,
			validatedLocation,
		],
	);

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

	if (propStatus === null || !propStatus.canUpdate) {
		if (propStatus?.reason === 'keyframed') {
			return (
				<TimelineKeyframedValue
					field={field}
					propStatus={propStatus}
					keyframeDisplayOffset={keyframeDisplayOffset}
				/>
			);
		}

		if (propStatus?.reason === 'computed') {
			return <UnsupportedStatus label={getComputedStatusLabel(propStatus)} />;
		}

		return null;
	}

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		codeValue: propStatus,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
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
		/>
	);
};

export const TimelineEffectFieldRow: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
}> = ({
	field,
	validatedLocation,
	rowDepth,
	nodePath,
	nodePathInfo,
	keyframeDisplayOffset,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
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
			Internals.getEffectCodeValuesCtx({
				codeValues,
				nodePath,
				effectIndex: field.effectIndex,
			}),
		[codeValues, nodePath, field.effectIndex],
	);

	const propStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.[field.key] ?? null)
			: null;

	const dragOverrideValue = useMemo(() => {
		const overrides = getEffectDragOverrides(nodePath, field.effectIndex);
		return overrides[field.key];
	}, [getEffectDragOverrides, nodePath, field.effectIndex, field.key]);

	const keyframeControls =
		propStatus !== null &&
		shouldShowTimelineKeyframeControls({
			propStatus,
			selected: selection.selected,
		}) ? (
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
			/>
		) : null;

	const isNonDefault = useMemo(() => {
		if (!propStatus || !propStatus.canUpdate) {
			return false;
		}

		const effectiveCodeValue =
			propStatus.codeValue ?? field.fieldSchema.default;
		return (
			JSON.stringify(effectiveCodeValue) !==
			JSON.stringify(field.fieldSchema.default)
		);
	}, [field.fieldSchema.default, propStatus]);

	const canPerformReset =
		previewServerState.type === 'connected' &&
		propStatus !== null &&
		propStatus.canUpdate;

	const onReset = useCallback(() => {
		if (
			!canPerformReset ||
			previewServerState.type !== 'connected' ||
			!isNonDefault
		) {
			return;
		}

		const defaultValue =
			field.fieldSchema.default !== undefined
				? JSON.stringify(field.fieldSchema.default)
				: null;

		saveEffectProp({
			fileName: validatedLocation.source,
			nodePath,
			effectIndex: field.effectIndex,
			fieldKey: field.key,
			value: field.fieldSchema.default,
			defaultValue,
			schema: field.effectSchema,
			setCodeValues,
			clientId: previewServerState.clientId,
		});
	}, [
		canPerformReset,
		field.effectIndex,
		field.effectSchema,
		field.fieldSchema.default,
		field.key,
		isNonDefault,
		nodePath,
		previewServerState,
		setCodeValues,
		validatedLocation.source,
	]);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		return [
			{
				type: 'item',
				id: 'reset-effect-field',
				keyHint: null,
				label: 'Reset',
				leftItem: null,
				disabled: !canPerformReset,
				onClick: onReset,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'reset-effect-field',
			},
		];
	}, [canPerformReset, onReset]);

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
				<Value
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
