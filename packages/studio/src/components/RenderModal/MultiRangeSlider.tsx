import type {ChangeEvent, FC} from 'react';
import React, {useCallback, useMemo} from 'react';
import {BLUE, INPUT_BACKGROUND} from '../../helpers/colors';

const container: React.CSSProperties = {
	borderColor: 'black',
	borderStyle: 'solid',
	borderWidth: '2px',
	height: 39,
	width: 220,
	position: 'relative',
	backgroundColor: INPUT_BACKGROUND,
	marginLeft: 8,
	marginRight: 8,
	borderRadius: 2,
};

// blue slider
const sliderRange: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	backgroundColor: BLUE,
	height: 35,
};

interface MultiRangeSliderProps {
	readonly min: number;
	readonly max: number;
	readonly start: number;
	readonly end: number;
	readonly step: number;
	readonly onLeftThumbDrag: (newVal: number) => void;
	readonly onRightThumbDrag: (newVal: number) => void;
}

export const MultiRangeSlider: FC<MultiRangeSliderProps> = ({
	min,
	max,
	start,
	end,
	step,
	onLeftThumbDrag,
	onRightThumbDrag,
}) => {
	const getPercent = useCallback(
		(value: number) => Math.round(((value - min) / (max - min)) * 100),
		[min, max],
	);

	const rangeStyle = useMemo((): React.CSSProperties => {
		const minPercent = getPercent(start);
		const maxPercent = getPercent(end);

		return {
			...sliderRange,
			left: `${minPercent}%`,
			width: `${maxPercent - minPercent}%`,
		};
	}, [end, getPercent, start]);

	const onChangeLeft = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const value = Math.min(Number(event.target.value), end - 1);
			onLeftThumbDrag(value);
		},
		[end, onLeftThumbDrag],
	);

	const onChangeRight = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const value = Math.max(Number(event.target.value), start + 1);
			onRightThumbDrag(value);
		},
		[onRightThumbDrag, start],
	);

	return (
		<div style={container}>
			<input
				type="range"
				min={min}
				max={max}
				value={start}
				step={step}
				onChange={onChangeLeft}
				className="__remotion_thumb"
			/>

			<input
				type="range"
				min={min}
				max={max}
				value={end}
				step={step}
				onChange={onChangeRight}
				className="__remotion_thumb"
			/>
			<div style={rangeStyle} />
		</div>
	);
};
