import React, {useCallback} from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {label, optionRow, rightRow} from './layout';
import {MultiRangeSlider} from './MultiRangeSlider';

const INPUT_WIDTH = 40;

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

	const onStartFrameChanged = useCallback(
		(newVal: string) => {
			onStartFrameChangedDirectly(parseInt(newVal, 10));
		},
		[onStartFrameChangedDirectly],
	);

	const onEndFrameChanged = useCallback(
		(newVal: string) => {
			onEndFrameChangedDirectly(parseInt(newVal, 10));
		},
		[onEndFrameChangedDirectly],
	);
	return (
		<div style={optionRow}>
			<div style={label}>Frame range</div>
			<div style={rightRow}>
				<div style={{width: INPUT_WIDTH}}>
					<InputDragger
						min={minStartFrame}
						max={endFrame - 1}
						name="Start frame"
						value={startFrame}
						step={1}
						onTextChange={onStartFrameChanged}
						onValueChange={onStartFrameChangedDirectly}
						status="ok"
						rightAlign
						style={{width: INPUT_WIDTH}}
					/>
				</div>
				<MultiRangeSlider
					min={minStartFrame}
					max={maxEndFrame}
					start={startFrame}
					end={endFrame}
					step={1}
					onLeftThumbDrag={onStartFrameChangedDirectly}
					onRightThumbDrag={onEndFrameChangedDirectly}
				/>{' '}
				<div style={{width: INPUT_WIDTH}}>
					<InputDragger
						min={startFrame + 1}
						max={maxEndFrame}
						name="End frame"
						value={endFrame}
						step={1}
						onTextChange={onEndFrameChanged}
						onValueChange={onEndFrameChangedDirectly}
						status="ok"
						rightAlign
						style={{width: INPUT_WIDTH}}
					/>
				</div>
			</div>
		</div>
	);
};
