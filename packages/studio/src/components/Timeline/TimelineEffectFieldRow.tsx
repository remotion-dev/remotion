import {optimisticUpdateForEffectCodeValues} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateEffectPropsResponse,
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {EffectSchemaFieldInfo} from '../../helpers/timeline-layout';
import {EXPANDED_SECTION_PADDING_RIGHT} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {Padder} from './Padder';
import {
	TimelineFieldValue,
	TimelineNonEditableStatus,
} from './TimelineSchemaField';

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

	const {getEffectCodeValues} = useContext(
		Internals.VisualModeCodeValuesContext,
	);

	const codeValues = getEffectCodeValues(nodePath, field.effectIndex);

	const propStatus = codeValues?.[field.key] ?? null;

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

			let previousUpdate: CanUpdateSequencePropsResponse | undefined;

			setCodeValues(nodePath, (prev) => {
				previousUpdate = prev;
				return optimisticUpdateForEffectCodeValues({
					previous: prev,
					effectIndex: field.effectIndex,
					fieldKey: field.key,
					value,
					schema: field.effectSchema,
				});
			});

			return callApi('/api/save-effect-props', {
				fileName: validatedLocation.source,
				sequenceNodePath: nodePath,
				effectIndex: field.effectIndex,
				key: field.key,
				value: stringifiedValue,
				defaultValue,
				schema: field.effectSchema,
			})
				.then((data: CanUpdateEffectPropsResponse) => {
					setCodeValues(nodePath, (prev) => {
						if (!prev.canUpdate) {
							return prev;
						}

						const idx = prev.effects.findIndex(
							(e) => e.effectIndex === field.effectIndex,
						);
						if (idx === -1) {
							return {
								...prev,
								effects: [...prev.effects, data],
							};
						}

						const next = [...prev.effects];
						next[idx] = data;
						return {...prev, effects: next};
					});
				})
				.catch((err) => {
					setCodeValues(nodePath, (current) => {
						if (previousUpdate) {
							return previousUpdate;
						}

						return current;
					});
					showNotification(
						`Could not save effect prop: ${
							err instanceof Error ? err.message : String(err)
						}`,
						4000,
					);
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

	if (propStatus === null) {
		return null;
	}

	if (propStatus.canUpdate === false) {
		return <TimelineNonEditableStatus propStatus={propStatus} />;
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
