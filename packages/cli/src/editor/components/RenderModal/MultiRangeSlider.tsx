import type {ChangeEvent, FC} from 'react';
import React, {useCallback, useEffect, useRef} from 'react';
import {BLUE} from '../../helpers/colors';

const DARKEND_BLUE = '#0a4279';

const container: React.CSSProperties = {
	borderColor: 'black',
	borderStyle: 'solid',
	height: 39,
	width: 220,
	position: 'relative',
	backgroundColor: DARKEND_BLUE,
	marginLeft: 8,
	marginRight: 8,
};

const slider: React.CSSProperties = {
	position: 'relative',
	width: 210,
	height: 38,
	marginLeft: 10,
};

const sliderRange: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	backgroundColor: BLUE,
	height: 39,
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
						const value = Math.min(Number(event.target.value), end - 1);
						onLeftThumbDrag(value);
					}}
					className="__remotion_thumb __remotion_thumbLeft"
				/>

				<input
					type="range"
					min={min}
					max={max}
					value={end}
					step={step}
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						const value = Math.max(Number(event.target.value), start + 1);
						onRightThumbDrag(value);
					}}
					className="__remotion_thumb"
				/>
				<div ref={range} style={sliderRange} />
			</div>
		</div>
	);
};
