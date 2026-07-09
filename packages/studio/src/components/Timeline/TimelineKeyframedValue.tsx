import React, {useCallback, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	DragOverrideValue,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {TimelineFieldValue} from './TimelineSchemaField';

const valuesEqual = (left: unknown, right: unknown): boolean => {
	return JSON.stringify(left) === JSON.stringify(right);
};

export const TimelineKeyframedValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly sourceFrame: number;
	readonly dragOverrideValue: DragOverrideValue | undefined;
	readonly onSave: (value: unknown, sourceFrame: number) => Promise<void>;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey;
}> = ({
	field,
	propStatus,
	sourceFrame,
	dragOverrideValue,
	onSave,
	onDragValueChange,
	onDragEnd,
	scaleLockNodePath,
}) => {
	const computedValue = useMemo(() => {
		const raw = Internals.interpolateKeyframedStatus({
			forceSpringAllowTail: false,
			frame: sourceFrame,
			status: propStatus,
		});
		if (typeof raw === 'number') {
			return Math.round(raw * 100) / 100;
		}

		return raw;
	}, [propStatus, sourceFrame]);

	const fakeStatus: CanUpdateSequencePropStatusStatic = useMemo(
		() => ({
			status: 'static',
			codeValue: computedValue,
		}),
		[computedValue],
	);

	const effectiveValue = useMemo(() => {
		return Internals.getEffectiveVisualModeValue({
			propStatus: fakeStatus,
			dragOverrideValue,
			frame: sourceFrame,
			defaultValue: field.fieldSchema.default,
			shouldResortToDefaultValueIfUndefined: true,
		});
	}, [dragOverrideValue, fakeStatus, field.fieldSchema.default, sourceFrame]);

	const onSaveIfChanged = useCallback<TimelineFieldOnSave>(
		(value) => {
			const existingKeyframe = propStatus.keyframes.find(
				(keyframe) => keyframe.frame === sourceFrame,
			);
			if (
				valuesEqual(value, computedValue) ||
				(existingKeyframe && valuesEqual(value, existingKeyframe.value))
			) {
				return Promise.resolve();
			}

			return onSave(value, sourceFrame);
		},
		[computedValue, onSave, propStatus.keyframes, sourceFrame],
	);

	if (computedValue === null) {
		return null;
	}

	return (
		<TimelineFieldValue
			field={field}
			propStatus={fakeStatus}
			effectiveValue={effectiveValue}
			onSave={onSaveIfChanged}
			onDragValueChange={onDragValueChange}
			onDragEnd={onDragEnd}
			scaleLockNodePath={scaleLockNodePath}
		/>
	);
};
