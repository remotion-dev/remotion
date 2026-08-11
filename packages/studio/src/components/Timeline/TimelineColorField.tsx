import React, {useCallback, useMemo} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {BLACK_HEX, BLUE, LIGHT_TEXT} from '../../helpers/colors';
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
const DEFAULT_SET_COLOR = '#808080';

const noneLabelStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
};

const setButtonStyle: React.CSSProperties = {
	background: 'none',
	border: 'none',
	color: BLUE,
	cursor: 'pointer',
	fontSize: 12,
	margin: 0,
	padding: 0,
};

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

	if (currentValue === 'none') {
		return (
			<span style={containerStyle}>
				<span style={noneLabelStyle}>None</span>
				<button
					type="button"
					style={setButtonStyle}
					title={`Set ${field.description ?? field.key} to gray`}
					onClick={() => onChangeComplete(DEFAULT_SET_COLOR)}
				>
					Set
				</button>
			</span>
		);
	}

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
