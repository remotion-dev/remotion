import React, {useCallback} from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import {label, optionRow, rightRow} from './layout';

export const FrameRangeSetting: React.FC<{
	startFrame: number;
	endFrame: number;
	setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
	setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
	durationInFrames: number;
}> = ({startFrame, endFrame, setEndFrame, durationInFrames, setStartFrame}) => {
	const maxStartFrame = endFrame - 1;
	const minStartFrame = 0;

	const minEndFrame = startFrame + 1;
	const maxEndFrame = durationInFrames - 1;

	const onStartFrameChangedDirectly = useCallback(
		(newStartFrame: number) => {
			setStartFrame(newStartFrame);
		},
		[setStartFrame]
	);

	const onEndFrameChangedDirectly = useCallback(
		(newEndFrame: number) => {
			setEndFrame(newEndFrame);
		},
		[setEndFrame]
	);

	const onStartFrameChanged = useCallback(
		(e: string) => {
			setStartFrame((q) => {
				const newStartFrame = parseInt(e, 10);
				if (Number.isNaN(newStartFrame)) {
					return q;
				}

				const newStartFrameClamped = Math.min(
					maxStartFrame,
					Math.max(newStartFrame, minStartFrame)
				);
				return newStartFrameClamped;
			});
		},
		[maxStartFrame, setStartFrame]
	);

	const onEndFrameChanged = useCallback(
		(e: string) => {
			setEndFrame((q) => {
				const newEndFrame = parseInt(e, 10);
				if (Number.isNaN(newEndFrame)) {
					return q;
				}

				const newEndFrameClamped = Math.min(
					maxEndFrame,
					Math.max(newEndFrame, minEndFrame)
				);
				return newEndFrameClamped;
			});
		},
		[maxEndFrame, minEndFrame, setEndFrame]
	);

	return (
		<div style={optionRow}>
			<div style={label}>Frame range</div>
			<div style={rightRow}>
				<RightAlignInput>
					<InputDragger
						value={startFrame}
						onTextChange={onStartFrameChanged}
						placeholder={`${minStartFrame}-${maxStartFrame}`}
						onValueChange={onStartFrameChangedDirectly}
						name="startFrame"
						step={1}
						min={minStartFrame}
						max={maxStartFrame}
					/>
				</RightAlignInput>
				<RightAlignInput>
					<InputDragger
						value={endFrame}
						onTextChange={onEndFrameChanged}
						placeholder={`${minEndFrame}-${maxEndFrame}`}
						onValueChange={onEndFrameChangedDirectly}
						name="endFrame"
						step={1}
						min={minEndFrame}
						max={maxEndFrame}
					/>
				</RightAlignInput>
			</div>
		</div>
	);
};
