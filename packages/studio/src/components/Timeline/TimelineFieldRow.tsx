import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {CanUpdateSequencePropStatus} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {TimelineFieldValue} from './TimelineSchemaField';

const fieldRow: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	paddingLeft: 24,
};

const fieldName: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
};

const fieldLabelRow: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: 6,
};

export const TimelineFieldRow: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly overrideId: string;
	readonly validatedLocation: CodePosition | null;
}> = ({field, overrideId, validatedLocation}) => {
	const {
		setDragOverrides,
		clearDragOverrides,
		dragOverrides,
		codeValues: allPropStatuses,
	} = useContext(Internals.VisualModeOverridesContext);

	const propStatuses = (allPropStatuses[overrideId] ?? null) as Record<
		string,
		CanUpdateSequencePropStatus
	> | null;

	const propStatus = propStatuses?.[field.key] ?? null;

	const dragOverrideValue = useMemo(() => {
		return (dragOverrides[overrideId] ?? {})[field.key];
	}, [dragOverrides, overrideId, field.key]);

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		codeValue: propStatus,
		runtimeValue: field.currentValue,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
	});

	const onSave = useCallback(
		(key: string, value: unknown): Promise<void> => {
			if (!propStatuses || !validatedLocation) {
				return Promise.reject(new Error('Cannot save'));
			}

			const status = propStatuses[key];
			if (!status || !status.canUpdate) {
				return Promise.reject(new Error('Cannot save'));
			}

			const defaultValue =
				field.fieldSchema.default !== undefined
					? JSON.stringify(field.fieldSchema.default)
					: null;

			return callApi('/api/save-sequence-props', {
				fileName: validatedLocation.source,
				line: validatedLocation.line,
				column: validatedLocation.column,
				key,
				value: JSON.stringify(value),
				enumPaths: [],
				defaultValue,
			}).then(() => undefined);
		},
		[propStatuses, validatedLocation, field.fieldSchema.default],
	);

	const onDragValueChange = useCallback(
		(key: string, value: unknown) => {
			setDragOverrides(overrideId, key, value);
		},
		[setDragOverrides, overrideId],
	);

	const onDragEnd = useCallback(() => {
		clearDragOverrides(overrideId);
	}, [clearDragOverrides, overrideId]);

	const style = useMemo(() => {
		return {
			...fieldRow,
			height: field.rowHeight,
		};
	}, [field.rowHeight]);

	return (
		<div style={style}>
			<div style={fieldLabelRow}>
				<span style={fieldName}>{field.description ?? field.key}</span>
			</div>
			<TimelineFieldValue
				field={field}
				propStatus={propStatus}
				onSave={onSave}
				onDragValueChange={onDragValueChange}
				onDragEnd={onDragEnd}
				canUpdate={propStatus?.canUpdate ?? false}
				effectiveValue={effectiveValue}
			/>
		</div>
	);
};
