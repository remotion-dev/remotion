import React, {useCallback, useEffect, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {RemotionInput} from '../NewComposition/RemInput';

const inputStyle: React.CSSProperties = {
	fontSize: 12,
	padding: '4px 6px',
	width: 110,
};

export const TimelineTransformOriginField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({field, effectiveValue, onSave, onDragValueChange, onDragEnd}) => {
	const currentValue =
		typeof effectiveValue === 'string'
			? effectiveValue
			: field.fieldSchema.type === 'transform-origin'
				? (field.fieldSchema.default ?? '50% 50%')
				: '50% 50%';
	const [value, setValue] = useState(currentValue);

	useEffect(() => {
		setValue(currentValue);
	}, [currentValue]);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			const next = event.target.value;
			setValue(next);
			onDragValueChange(next);
		},
		[onDragValueChange],
	);

	const onBlur = useCallback(() => {
		const next = value.trim();
		if (next === '') {
			setValue(currentValue);
			onDragValueChange(currentValue);
			onDragEnd();
			return;
		}

		if (next !== currentValue) {
			onSave(next).finally(() => {
				onDragEnd();
			});
			return;
		}

		onDragEnd();
	}, [currentValue, onDragEnd, onDragValueChange, onSave, value]);

	const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			if (event.key === 'Enter') {
				event.currentTarget.blur();
			}
		},
		[],
	);

	return (
		<RemotionInput
			type="text"
			value={value}
			status="ok"
			rightAlign={false}
			style={inputStyle}
			onChange={onChange}
			onBlur={onBlur}
			onKeyDown={onKeyDown}
			title={currentValue}
		/>
	);
};
