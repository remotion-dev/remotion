import {optimisticUpdateForEffectCodeValues} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {EffectSchemaFieldInfo} from '../../helpers/timeline-layout';
import {EXPANDED_SECTION_PADDING_RIGHT} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {getComputedStatusLabel} from './get-timeline-keyframes';
import {enqueueSavePropChange} from './save-prop-queue';
import {getTimelineFieldLabelRowStyle} from './timeline-field-row-layout';
import {TimelineExpandArrowSpacer} from './TimelineExpandArrowButton';
import {TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {TimelineFieldValue, UnsupportedStatus} from './TimelineSchemaField';
import {
	TIMELINE_SELECTED_LABEL_BACKGROUND,
	TIMELINE_SELECTED_LABEL_TEXT,
	useTimelineRowSelection,
} from './TimelineSelection';

const fieldRowBase: React.CSSProperties = {};

const valueColumnStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flex: 1,
	minWidth: 0,
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

const fieldName: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
};

const Value: React.FC<{
	readonly field: EffectSchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
}> = ({field, nodePath, validatedLocation}) => {
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
		if (
			propStatus?.reason === 'computed' ||
			propStatus?.reason === 'keyframed'
		) {
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
}> = ({field, validatedLocation, rowDepth, nodePath, nodePathInfo}) => {
	const selection = useTimelineRowSelection(nodePathInfo);
	const style = useMemo(() => {
		return {
			...fieldRowBase,
			height: field.rowHeight,
		};
	}, [field.rowHeight]);

	const labelRowStyle = useMemo(
		(): React.CSSProperties => ({
			...getTimelineFieldLabelRowStyle(rowDepth),
			alignSelf: 'stretch',
			backgroundColor: selection.selected
				? TIMELINE_SELECTED_LABEL_BACKGROUND
				: undefined,
		}),
		[rowDepth, selection.selected],
	);

	const fieldNameStyle = useMemo(
		(): React.CSSProperties => ({
			...fieldName,
			color: selection.selected
				? TIMELINE_SELECTED_LABEL_TEXT
				: fieldName.color,
		}),
		[selection.selected],
	);

	return (
		<TimelineRowChrome
			depth={rowDepth}
			eye={<TimelineLayerEyeSpacer />}
			arrow={<TimelineExpandArrowSpacer />}
			style={style}
			selected={selection.selected}
			selectable={selection.selectable}
			onSelect={selection.onSelect}
		>
			<div style={labelRowStyle}>
				<span style={fieldNameStyle}>{field.description ?? field.key}</span>
			</div>
			<div style={valueColumnStyle}>
				<Value
					field={field}
					nodePath={nodePath}
					validatedLocation={validatedLocation}
				/>
			</div>
		</TimelineRowChrome>
	);
};
