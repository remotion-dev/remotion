import type {SequenceNodePath} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {CanUpdateSequencePropStatus} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {
	EXPANDED_SECTION_PADDING_LEFT,
	EXPANDED_SECTION_PADDING_RIGHT,
} from './TimelineExpandedSection';
import {SPACING} from './TimelineListItem';
import {TimelineFieldValue} from './TimelineSchemaField';

const FIELD_ROW_PADDING_LEFT = 24;

const fieldRowBase: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

const fieldName: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
};

const fieldLabelRow: React.CSSProperties = {
	flex: '0 0 50%',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: 6,
};

export const TimelineFieldRow: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly overrideId: string;
	readonly validatedLocation: CodePosition | null;
	readonly nestedDepth: number;
	readonly nodePath: SequenceNodePath | null;
}> = ({field, overrideId, validatedLocation, nestedDepth, nodePath}) => {
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
		shouldResortToDefaultValueIfUndefined: true,
	});

	const onSave = useCallback(
		(key: string, value: unknown): Promise<void> => {
			if (!propStatuses || !validatedLocation || !nodePath) {
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
				nodePath,
				key,
				value: JSON.stringify(value),
				enumPaths: [],
				defaultValue,
			}).then(() => undefined);
		},
		[propStatuses, validatedLocation, nodePath, field.fieldSchema.default],
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
			...fieldRowBase,
			height: field.rowHeight,
			paddingLeft:
				EXPANDED_SECTION_PADDING_LEFT +
				FIELD_ROW_PADDING_LEFT +
				SPACING * 3 * nestedDepth,
		};
	}, [field.rowHeight, nestedDepth]);

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
