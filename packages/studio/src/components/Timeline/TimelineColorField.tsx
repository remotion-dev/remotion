import React, {useCallback, useMemo} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {BLACK_HEX} from '../../helpers/colors';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {ColorPicker} from '../ColorPicker/ColorPicker';

const containerStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 3,
};

const SWATCH_WIDTH = 20;
const SWATCH_HEIGHT = 15;

export const TimelineColorField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	effectiveValue,
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const currentValue =
		typeof effectiveValue === 'string'
			? effectiveValue
			: field.fieldSchema.type === 'color'
				? (field.fieldSchema.default ?? BLACK_HEX)
				: '';

	const onChange = useCallback(
		(next: string) => {
			onDragValueChange(next);
		},
		[onDragValueChange],
	);

	const onChangeComplete = useCallback(
		(next: string) => {
			if (next !== propStatus.codeValue) {
				onSave(next);
			}

			onDragEnd();
		},
		[onSave, onDragEnd, propStatus],
	);

	const swatchStyle = useMemo<React.CSSProperties>(() => {
		return {
			marginLeft: 5,
		};
	}, []);

	return (
		<span style={containerStyle}>
			<ColorPicker
				value={currentValue}
				status="ok"
				onChange={onChange}
				onChangeComplete={onChangeComplete}
				width={SWATCH_WIDTH}
				height={SWATCH_HEIGHT}
				disabled={false}
				name={field.key}
				title={currentValue}
				style={swatchStyle}
			/>
		</span>
	);
};
