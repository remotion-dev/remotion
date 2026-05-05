import type {SequenceNodePath} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {EXPANDED_SECTION_PADDING_RIGHT} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {Padder} from './Padder';
import {TimelineFieldValue} from './TimelineSchemaField';

const fieldRowBase: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

const fieldName: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
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
	readonly paddingLeft: number;
	readonly nestedDepth: number;
	readonly nodePath: SequenceNodePath | null;
	readonly schema: SequenceSchema;
}> = ({
	field,
	overrideId,
	validatedLocation,
	paddingLeft,
	nestedDepth,
	nodePath,
	schema,
}) => {
	const {setDragOverrides, clearDragOverrides, dragOverrides, codeValues} =
		useContext(Internals.VisualModeOverridesContext);

	const codeValuesForOverride = codeValues[overrideId] ?? null;
	const codeValue = codeValuesForOverride?.[field.key] ?? null;

	const dragOverrideValue = useMemo(() => {
		return (dragOverrides[overrideId] ?? {})[field.key];
	}, [dragOverrides, overrideId, field.key]);

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		codeValue,
		runtimeValue: field.currentRuntimeValue,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
		shouldResortToDefaultValueIfUndefined: true,
	});

	const {setCodeValues} = useContext(Internals.VisualModeOverridesContext);

	const onSave = useCallback(
		(key: string, value: unknown): Promise<void> => {
			if (!codeValuesForOverride || !validatedLocation || !nodePath) {
				return Promise.reject(new Error('Cannot save'));
			}

			const status = codeValuesForOverride[key];
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
				defaultValue,
				schema,
			}).then((data) => {
				if (data.success) {
					if (data.newStatus.canUpdate) {
						setCodeValues(overrideId, data.newStatus.props);
					} else {
						setCodeValues(overrideId, null);
					}

					return;
				}

				return Promise.reject(new Error(data.reason));
			});
		},
		[
			codeValuesForOverride,
			field.fieldSchema.default,
			nodePath,
			overrideId,
			schema,
			setCodeValues,
			validatedLocation,
		],
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
			paddingLeft,
		};
	}, [field.rowHeight, paddingLeft]);

	return (
		<div style={style}>
			<Padder depth={nestedDepth + 1} />
			<div style={fieldLabelRow}>
				<span style={fieldName}>{field.description ?? field.key}</span>
			</div>
			<TimelineFieldValue
				field={field}
				propStatus={codeValue}
				onSave={onSave}
				onDragValueChange={onDragValueChange}
				onDragEnd={onDragEnd}
				canUpdate={codeValue?.canUpdate ?? false}
				effectiveValue={effectiveValue}
				codeValue={codeValue}
			/>
		</div>
	);
};
