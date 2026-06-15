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
	readonly keyframeDisplayOffset: number;
	readonly sourceFrame?: number;
	readonly dragOverrideValue: DragOverrideValue | undefined;
	readonly onSave: (value: unknown, sourceFrame: number) => Promise<void>;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey;
}> = ({
	field,
	propStatus,
	keyframeDisplayOffset,
	sourceFrame,
	dragOverrideValue,
	onSave,
	onDragValueChange,
	onDragEnd,
	scaleLockNodePath,
}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const jsxFrame = sourceFrame ?? timelinePosition - keyframeDisplayOffset;

	const computedValue = useMemo(() => {
		const raw = Internals.interpolateKeyframedStatus({
			frame: jsxFrame,
			status: propStatus,
		});
		if (typeof raw === 'number') {
			return Math.round(raw * 100) / 100;
		}

		return raw;
	}, [jsxFrame, propStatus]);

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
			frame: jsxFrame,
			defaultValue: field.fieldSchema.default,
			shouldResortToDefaultValueIfUndefined: true,
		});
	}, [dragOverrideValue, fakeStatus, field.fieldSchema.default, jsxFrame]);

	const onSaveIfChanged = useCallback<TimelineFieldOnSave>(
		(value) => {
			const existingKeyframe = propStatus.keyframes.find(
				(keyframe) => keyframe.frame === jsxFrame,
			);
			if (
				valuesEqual(value, computedValue) ||
				(existingKeyframe && valuesEqual(value, existingKeyframe.value))
			) {
				return Promise.resolve();
			}

			return onSave(value, jsxFrame);
		},
		[computedValue, jsxFrame, onSave, propStatus.keyframes],
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
