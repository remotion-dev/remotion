import React, {useCallback, useContext, useMemo} from 'react';
import type {SequenceNodePath} from 'remotion';
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
	readonly validatedLocation: CodePosition | null;
	readonly paddingLeft: number;
	readonly nestedDepth: number;
	readonly nodePath: SequenceNodePath;
	readonly schema: SequenceSchema;
}> = ({
	field,
	validatedLocation,
	paddingLeft,
	nestedDepth,
	nodePath,
	schema,
}) => {
	const {getCodeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);

	const codeValuesForOverride = getCodeValues(nodePath);
	const codeValue = codeValuesForOverride?.[field.key] ?? null;

	const dragOverrideValue = useMemo(() => {
		return nodePath === null
			? undefined
			: (getDragOverrides(nodePath) ?? {})[field.key];
	}, [getDragOverrides, nodePath, field.key]);

	const effectiveValue = Internals.getEffectiveVisualModeValue({
		codeValue,
		runtimeValue: field.currentRuntimeValue,
		dragOverrideValue,
		defaultValue: field.fieldSchema.default,
		shouldResortToDefaultValueIfUndefined: true,
	});

	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);

	const onSave = useCallback(
		(value: unknown): Promise<void> => {
			if (!codeValuesForOverride || !validatedLocation || !nodePath) {
				return Promise.reject(new Error('Cannot save'));
			}

			if (!codeValue || !codeValue.canUpdate) {
				return Promise.reject(new Error('Cannot save'));
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

			return callApi('/api/save-sequence-props', {
				fileName: validatedLocation.source,
				nodePath,
				key: field.key,
				value: stringifiedValue,
				defaultValue,
				schema,
			}).then((data) => {
				if (data.success) {
					setCodeValues(nodePath, data.newStatus);
					return;
				}

				return Promise.reject(new Error(data.reason));
			});
		},
		[
			codeValue,
			codeValuesForOverride,
			field.fieldSchema.default,
			field.key,
			nodePath,
			schema,
			setCodeValues,
			validatedLocation,
		],
	);

	const onDragValueChange = useCallback(
		(value: unknown) => {
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
