import {optimisticUpdateForEffectCodeValues} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {EffectSchemaFieldInfo} from '../../helpers/timeline-layout';
import {EXPANDED_SECTION_PADDING_RIGHT} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {Padder} from './Padder';
import {enqueueSavePropChange} from './save-prop-queue';
import {TimelineFieldValue, UnsupportedStatus} from './TimelineSchemaField';

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
					}),
				errorLabel: 'Could not save effect prop',
			});
		},
		[
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
		if (propStatus?.reason === 'computed') {
			return <UnsupportedStatus label="computed" />;
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
	readonly paddingLeft: number;
	readonly nestedDepth: number;
	readonly nodePath: SequencePropsSubscriptionKey;
}> = ({field, validatedLocation, paddingLeft, nestedDepth, nodePath}) => {
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
			<Value
				field={field}
				nodePath={nodePath}
				validatedLocation={validatedLocation}
			/>
		</div>
	);
};
