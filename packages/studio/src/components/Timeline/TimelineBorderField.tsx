import React, {useCallback, useMemo, useState} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {ColorPicker} from '../ColorPicker/ColorPicker';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	BORDER_STYLE_KEYWORDS,
	parseBorder,
	serializeBorder,
	type ParsedBorder,
} from './timeline-border-utils';

const containerStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 4,
};

const widthDraggerStyle: React.CSSProperties = {
	paddingLeft: 0,
	width: 44,
};

const comboboxStyle: React.CSSProperties = {
	marginLeft: 0,
};

const swatchStyle: React.CSSProperties = {
	marginLeft: 2,
};

const SWATCH_WIDTH = 20;
const SWATCH_HEIGHT = 15;

export const TimelineBorderField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	propStatus,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const parsed = useMemo(() => parseBorder(effectiveValue), [effectiveValue]);
	const [dragWidth, setDragWidth] = useState<number | null>(null);

	const serialize = useCallback(
		(overrides: Partial<ParsedBorder>): string => {
			return serializeBorder({...parsed, ...overrides});
		},
		[parsed],
	);

	const saveIfChanged = useCallback(
		(value: string) => {
			if (value !== propStatus.codeValue) {
				return onSave(value);
			}

			return Promise.resolve();
		},
		[onSave, propStatus.codeValue],
	);

	const widthFormatter = useCallback(
		(value: number | string) => `${value}${parsed.widthUnit}`,
		[parsed.widthUnit],
	);

	const onWidthChange = useCallback(
		(newVal: number) => {
			setDragWidth(newVal);
			onDragValueChange(serialize({width: newVal}));
		},
		[onDragValueChange, serialize],
	);

	const onWidthChangeEnd = useCallback(
		(newVal: number) => {
			saveIfChanged(serialize({width: newVal})).finally(() => {
				setDragWidth(null);
				onDragEnd();
			});
		},
		[onDragEnd, saveIfChanged, serialize],
	);

	const onWidthTextChange = useCallback(
		(newVal: string) => {
			const parsedValue = Number(newVal);
			if (Number.isNaN(parsedValue)) {
				return;
			}

			setDragWidth(parsedValue);
			saveIfChanged(serialize({width: parsedValue})).finally(() => {
				setDragWidth(null);
			});
		},
		[saveIfChanged, serialize],
	);

	const onStyleSelect = useCallback(
		(newStyle: string) => {
			const value = serialize({style: newStyle as ParsedBorder['style']});
			onDragValueChange(value);
			saveIfChanged(value).finally(() => {
				onDragEnd();
			});
		},
		[onDragEnd, onDragValueChange, saveIfChanged, serialize],
	);

	const styleItems = useMemo<ComboboxValue[]>(() => {
		return BORDER_STYLE_KEYWORDS.map((keyword) => ({
			type: 'item',
			id: keyword,
			value: keyword,
			label: keyword,
			onClick: () => onStyleSelect(keyword),
			keyHint: null,
			leftItem: null,
			subMenu: null,
			quickSwitcherLabel: null,
			disabled: false,
		}));
	}, [onStyleSelect]);

	const onColorChange = useCallback(
		(next: string) => {
			onDragValueChange(serialize({color: next}));
		},
		[onDragValueChange, serialize],
	);

	const onColorChangeComplete = useCallback(
		(next: string) => {
			saveIfChanged(serialize({color: next}));
			onDragEnd();
		},
		[onDragEnd, saveIfChanged, serialize],
	);

	return (
		<span style={containerStyle}>
			<InputDragger
				type="number"
				value={dragWidth ?? parsed.width}
				style={widthDraggerStyle}
				status="ok"
				small
				onValueChange={onWidthChange}
				onValueChangeEnd={onWidthChangeEnd}
				onTextChange={onWidthTextChange}
				min={0}
				max={Infinity}
				step={1}
				formatter={widthFormatter}
				rightAlign={false}
				snapToStep={false}
				dragDecimalPlaces={2}
			/>
			<Combobox
				small
				title={`${field.key} style`}
				selectedId={parsed.style}
				values={styleItems}
				style={comboboxStyle}
			/>
			<ColorPicker
				value={parsed.color}
				status="ok"
				onChange={onColorChange}
				onChangeComplete={onColorChangeComplete}
				width={SWATCH_WIDTH}
				height={SWATCH_HEIGHT}
				disabled={false}
				name={field.key}
				title={parsed.color}
				style={swatchStyle}
			/>
		</span>
	);
};
