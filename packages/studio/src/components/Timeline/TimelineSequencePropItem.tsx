import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatusTrue,
	SequencePropsSubscriptionKey,
	SequenceSchema,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {ContextMenu} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {saveSequenceProp} from './save-sequence-prop';
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
import {
	TimelineFieldValue,
	TimelineNonEditableStatus,
} from './TimelineSchemaField';
import {useTimelineRowSelection} from './TimelineSelection';

const fieldRowBase: React.CSSProperties = {};

const Value: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly schema: SequenceSchema;
	readonly codeValue: CanUpdateSequencePropStatusTrue;
}> = ({field, nodePath, validatedLocation, schema, codeValue}) => {
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
		codeValue,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
		shouldResortToDefaultValueIfUndefined: true,
	});

	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const onSave = useCallback<TimelineFieldOnSave>(
		(value) => {
			if (!codeValue || !codeValue.canUpdate) {
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

			if (value === codeValue.codeValue) {
				return Promise.resolve();
			}

			if (
				defaultValue === stringifiedValue &&
				codeValue.codeValue === undefined
			) {
				return Promise.resolve();
			}

			return saveSequenceProp({
				fileName: validatedLocation.source,
				nodePath,
				fieldKey: field.key,
				value,
				defaultValue,
				schema,
				setCodeValues,
				clientId,
			});
		},
		[
			codeValue,
			clientId,
			field.fieldSchema.default,
			field.key,
			nodePath,
			schema,
			setCodeValues,
			validatedLocation,
		],
	);

	const onDragValueChange = useCallback<TimelineFieldOnDragValueChange>(
		(value) => {
			if (nodePath === null) {
				throw new Error('Cannot drag value');
			}

			setDragOverrides(nodePath, field.key, value);
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
			propStatus={codeValue}
			onSave={onSave}
			onDragValueChange={onDragValueChange}
			onDragEnd={onDragEnd}
			effectiveValue={effectiveValue}
		/>
	);
};

export const TimelineSequencePropItem: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly schema: SequenceSchema;
	readonly keyframeDisplayOffset: number;
}> = ({
	field,
	validatedLocation,
	rowDepth,
	nodePath,
	nodePathInfo,
	schema,
	keyframeDisplayOffset,
}) => {
	const {codeValues: visualModeCodeValues} = useContext(
		Internals.VisualModeCodeValuesContext,
	);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const selection = useTimelineRowSelection(nodePathInfo);

	const codeValuesForOverride = Internals.getCodeValuesCtx(
		visualModeCodeValues,
		nodePath,
	);
	const codeValue = codeValuesForOverride?.[field.key] ?? null;

	const dragOverrideValue = useMemo(() => {
		return (getDragOverrides(nodePath) ?? {})[field.key];
	}, [getDragOverrides, nodePath, field.key]);

	const keyframeControls =
		codeValue !== null &&
		shouldShowTimelineKeyframeControls({
			propStatus: codeValue,
			selected: selection.selected,
		}) ? (
			<TimelineKeyframeControls
				fieldKey={field.key}
				propStatus={codeValue}
				nodePath={nodePath}
				fileName={validatedLocation.source}
				keyframeDisplayOffset={keyframeDisplayOffset}
				defaultValue={field.fieldSchema.default}
				dragOverrideValue={dragOverrideValue}
				schema={schema}
				effectIndex={null}
			/>
		) : null;

	const style = useMemo(() => {
		return {
			...fieldRowBase,
			height: field.rowHeight,
		};
	}, [field.rowHeight]);

	const isNonDefault = useMemo(() => {
		if (!codeValue || !codeValue.canUpdate) {
			return false;
		}

		const effectiveCodeValue = codeValue.codeValue ?? field.fieldSchema.default;
		return (
			JSON.stringify(effectiveCodeValue) !==
			JSON.stringify(field.fieldSchema.default)
		);
	}, [codeValue, field.fieldSchema.default]);

	const canPerformReset =
		previewServerState.type === 'connected' &&
		codeValue !== null &&
		codeValue.canUpdate;

	const onReset = useCallback(() => {
		if (
			!canPerformReset ||
			previewServerState.type !== 'connected' ||
			codeValue === null ||
			!isNonDefault
		) {
			return;
		}

		const defaultValue =
			field.fieldSchema.default !== undefined
				? JSON.stringify(field.fieldSchema.default)
				: null;

		saveSequenceProp({
			fileName: validatedLocation.source,
			nodePath,
			fieldKey: field.key,
			value: field.fieldSchema.default,
			defaultValue,
			schema,
			setCodeValues,
			clientId: previewServerState.clientId,
		});
	}, [
		canPerformReset,
		field.fieldSchema.default,
		field.key,
		isNonDefault,
		nodePath,
		previewServerState,
		schema,
		setCodeValues,
		validatedLocation.source,
		codeValue,
	]);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		return [
			{
				type: 'item',
				id: 'reset-sequence-field',
				keyHint: null,
				label: 'Reset',
				leftItem: null,
				disabled: !canPerformReset,
				onClick: onReset,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'reset-sequence-field',
			},
		];
	}, [canPerformReset, onReset]);

	if (codeValue === null) {
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
			{codeValue.canUpdate ? (
				<div style={timelineFieldValueColumnStyle}>
					<Value
						field={field}
						nodePath={nodePath}
						validatedLocation={validatedLocation}
						schema={schema}
						codeValue={codeValue}
					/>
				</div>
			) : codeValue.reason === 'keyframed' ? (
				<div style={timelineFieldValueColumnStyle}>
					<TimelineKeyframedValue
						field={field}
						propStatus={codeValue}
						keyframeDisplayOffset={keyframeDisplayOffset}
					/>
				</div>
			) : (
				<div style={timelineFieldValueColumnStyle}>
					<TimelineNonEditableStatus propStatus={codeValue} />
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
