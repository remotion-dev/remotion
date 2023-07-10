import React, {ChangeEvent, FC, useCallback, useEffect, useRef} from 'react';
import {INPUT_BACKGROUND} from '../../helpers/colors';

const container: React.CSSProperties = {
	borderWidth: 1,
	borderColor: 'black',
	borderStyle: 'solid',
	height: 39,
	width: 210,
	position: 'relative',
	backgroundColor: INPUT_BACKGROUND,
	marginLeft: 16,
	marginRight: 8,
};

const slider: React.CSSProperties = {
	position: 'relative',
	width: 200,
	height: 38,
	left: 10,
};

const sliderRange: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	backgroundColor: 'black',
	height: 38,
};

interface MultiRangeSliderProps {
	min: number;
	max: number;
	start: number;
	end: number;
	step: number;
	onLeftThumbDrag: (newVal: number) => void;
	onRightThumbDrag: (newVal: number) => void;
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
	const range = useRef<HTMLDivElement>(null);

	const getPercent = useCallback(
		(value: number) => Math.round(((value - min) / (max - min)) * 100),
		[min, max]
	);

	useEffect(() => {
		const minPercent = getPercent(start);
		const maxPercent = getPercent(end);

		if (range.current) {
			range.current.style.left = `${minPercent - 5}%`;
			range.current.style.width = `${maxPercent - minPercent + 5}%`;
		}
	}, [start, getPercent]);

	useEffect(() => {
		const minPercent = getPercent(start);
		const maxPercent = getPercent(end);

		if (range.current) {
			range.current.style.width = `${maxPercent - minPercent + 5}%`;
		}
	}, [end, getPercent]);

	return (
		<div style={container}>
			<div style={slider}>
				<input
					type="range"
					min={min}
					max={max}
					value={start}
					step={step}
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						const value = Math.min(+event.target.value, end - 1);
						onLeftThumbDrag(value);
					}}
					className="thumb thumbLeft"
				/>

				<input
					type="range"
					min={min}
					max={max}
					value={end}
					step={step}
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						const value = Math.max(+event.target.value, start + 1);
						onRightThumbDrag(value);
					}}
					className="thumb"
				/>
				<div ref={range} style={sliderRange} />
			</div>
		</div>
	);
};
