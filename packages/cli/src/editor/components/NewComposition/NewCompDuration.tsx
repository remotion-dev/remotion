import React, {useCallback} from 'react';
import {validateCompositionDuration} from '../../helpers/validate-new-comp-data';
import {Row} from '../layout';
import {InputDragger} from './InputDragger';
import {inputArea, leftLabel, rightLabel} from './new-comp-layout';
import {ValidationMessage} from './ValidationMessage';

export const NewCompDuration: React.FC<{
	durationInFrames: string;
	fps: string;
	setDurationInFrames: React.Dispatch<React.SetStateAction<string>>;
}> = ({durationInFrames, setDurationInFrames, fps}) => {
	const onDurationInFramesChanged = useCallback(
		(newValue: string) => {
			setDurationInFrames(String(Number(newValue)));
		},
		[setDurationInFrames]
	);

	const onDurationChangedDirectly = useCallback(
		(newVal: number) => {
			setDurationInFrames(String(newVal));
		},
		[setDurationInFrames]
	);

	const compDurationErrMessage = validateCompositionDuration(durationInFrames);

	return (
		<div>
			<label>
				<Row align="center">
					<div style={leftLabel}> Duration in frames</div>
					<div style={inputArea}>
						<InputDragger
							type="number"
							value={durationInFrames}
							onTextChange={onDurationInFramesChanged}
							placeholder="Duration (frames)"
							name="durationInFrames"
							min={1}
							step={1}
							required
							// Hitting Promise.all() limit in Chrome
							max={300_000}
							onValueChange={onDurationChangedDirectly}
						/>
						{compDurationErrMessage ? (
							<ValidationMessage
								align="flex-start"
								message={compDurationErrMessage}
								type="error"
							/>
						) : null}
					</div>
					<span style={rightLabel}>
						{(Number(durationInFrames) / Number(fps)).toFixed(2)}sec
					</span>
				</Row>
			</label>
		</div>
	);
};
