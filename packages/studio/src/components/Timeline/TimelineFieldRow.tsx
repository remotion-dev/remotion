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
import {EXPANDED_SECTION_PADDING_RIGHT} from '../../helpers/timeline-layout';
import {saveSequenceProp} from './save-sequence-prop';
import {getTimelineFieldLabelRowStyle} from './timeline-field-row-layout';
import {TimelineExpandArrowSpacer} from './TimelineExpandArrowButton';
import {TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	TimelineFieldValue,
	TimelineNonEditableStatus,
} from './TimelineSchemaField';
import {
	TIMELINE_SELECTED_TEXT,
	useTimelineRowSelection,
} from './TimelineSelection';

const fieldRowBase: React.CSSProperties = {
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

const fieldName: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
};

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

export const TimelineFieldRow: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly schema: SequenceSchema;
}> = ({field, validatedLocation, rowDepth, nodePath, nodePathInfo, schema}) => {
	const {codeValues: visualModeCodeValues} = useContext(
		Internals.VisualModeCodeValuesContext,
	);
	const selection = useTimelineRowSelection(nodePathInfo);

	const codeValuesForOverride = Internals.getCodeValuesCtx(
		visualModeCodeValues,
		nodePath,
	);
	const codeValue = codeValuesForOverride?.[field.key] ?? null;

	const style = useMemo(() => {
		return {
			...fieldRowBase,
			height: field.rowHeight,
		};
	}, [field.rowHeight]);

	const labelRowStyle = useMemo(
		() => getTimelineFieldLabelRowStyle(rowDepth),
		[rowDepth],
	);

	const fieldNameStyle = useMemo(
		(): React.CSSProperties => ({
			...fieldName,
			color: selection.selected ? TIMELINE_SELECTED_TEXT : fieldName.color,
		}),
		[selection.selected],
	);

	if (codeValue === null) {
		return null;
	}

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
			{codeValue.canUpdate ? (
				<Value
					field={field}
					nodePath={nodePath}
					validatedLocation={validatedLocation}
					schema={schema}
					codeValue={codeValue}
				/>
			) : (
				<TimelineNonEditableStatus propStatus={codeValue} />
			)}
		</TimelineRowChrome>
	);
};
