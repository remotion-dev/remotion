import React from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {label, optionRow, rightRow} from './layout';
import {MultiRangeSlider} from './MultiRangeSlider';
import type {RenderFrameInput} from './use-render-frame-input';

const INPUT_WIDTH = 40;

const startFrameInputContainer: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'flex-end',
	width: INPUT_WIDTH,
};

export const FrameRangeSetting: React.FC<{
	readonly startFrame: RenderFrameInput;
	readonly endFrame: RenderFrameInput;
	readonly durationInFrames: number;
}> = ({startFrame, endFrame, durationInFrames}) => {
	const minStartFrame = 0;

	const maxEndFrame = durationInFrames - 1;

	return (
		<div style={optionRow}>
			<div style={label}>Frame range</div>
			<div style={rightRow}>
				<div style={startFrameInputContainer}>
					<InputDragger
						{...startFrame}
						min={minStartFrame}
						max={endFrame.value}
						name="Start frame"
						status="ok"
						rightAlign
						style={{width: INPUT_WIDTH}}
					/>
				</div>
				<MultiRangeSlider
					min={minStartFrame}
					max={maxEndFrame}
					start={startFrame.value}
					end={endFrame.value}
					step={1}
					onLeftThumbDrag={startFrame.onValueChangeEnd}
					onRightThumbDrag={endFrame.onValueChangeEnd}
				/>{' '}
				<div style={{width: INPUT_WIDTH}}>
					<InputDragger
						{...endFrame}
						min={startFrame.value}
						max={maxEndFrame}
						name="End frame"
						status="ok"
						rightAlign
						style={{width: INPUT_WIDTH}}
					/>
				</div>
			</div>
		</div>
	);
};
