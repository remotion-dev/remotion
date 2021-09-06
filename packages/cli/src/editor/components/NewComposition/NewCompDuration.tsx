import React, {ChangeEventHandler, useCallback} from 'react';
import {leftLabel, rightLabel} from './new-comp-layout';
import {RemotionInput} from './RemInput';

const label: React.CSSProperties = {
	fontSize: 13,
	color: 'rgba(255, 255, 255, 0.5)',
	marginLeft: 10,
};

export const NewCompDuration: React.FC<{
	durationInFrames: string;
	fps: string;
	setDurationInFrames: React.Dispatch<React.SetStateAction<string>>;
}> = ({durationInFrames, setDurationInFrames, fps}) => {
	const onDurationInFramesChanged: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setDurationInFrames(e.target.value);
		},
		[setDurationInFrames]
	);

	return (
		<div>
			<label>
				<div style={leftLabel}> Duration in frames</div>
				<RemotionInput
					type="number"
					value={durationInFrames}
					onChange={onDurationInFramesChanged}
					placeholder="Duration (frames)"
					name="height"
				/>
				<span style={rightLabel}>
					{(Number(durationInFrames) / Number(fps)).toFixed(2)}sec
				</span>
			</label>
		</div>
	);
};
