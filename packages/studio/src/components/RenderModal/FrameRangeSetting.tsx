import React, {useCallback} from 'react';
import {MultiRangeSlider} from './MultiRangeSlider';
import {label, optionRow, rightRow} from './layout';

const numberWrapper: React.CSSProperties = {
	minWidth: '39px',
	display: 'flex',
	justifyContent: 'flex-end',
	alignItems: 'center',
	fontSize: '14px',
};

export const FrameRangeSetting: React.FC<{
	readonly startFrame: number;
	readonly endFrame: number;
	readonly setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly durationInFrames: number;
}> = ({startFrame, endFrame, setEndFrame, durationInFrames, setStartFrame}) => {
	const minStartFrame = 0;

	const maxEndFrame = durationInFrames - 1;

	const onStartFrameChangedDirectly = useCallback(
		(newStartFrame: number) => {
			setStartFrame(newStartFrame);
		},
		[setStartFrame],
	);

	const onEndFrameChangedDirectly = useCallback(
		(newEndFrame: number) => {
			setEndFrame(newEndFrame);
		},
		[setEndFrame],
	);

	return (
		<div style={optionRow}>
			<div style={label}>Frame range</div>
			<div style={rightRow}>
				<div style={numberWrapper}>{startFrame}</div>
				<MultiRangeSlider
					min={minStartFrame}
					max={maxEndFrame}
					start={startFrame}
					end={endFrame}
					step={1}
					onLeftThumbDrag={onStartFrameChangedDirectly}
					onRightThumbDrag={onEndFrameChangedDirectly}
				/>
				<div style={numberWrapper}>{endFrame}</div>
			</div>
		</div>
	);
};
