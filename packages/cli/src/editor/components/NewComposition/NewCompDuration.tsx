import React, {ChangeEventHandler, useCallback} from 'react';
import {validateCompositionDuration} from '../../helpers/validate-new-comp-data';
import {Row} from '../layout';
import {InputDragger} from './InputDragger';
import {inputArea, leftLabel, rightLabel} from './new-comp-layout';
import {ValidationMessage} from './ValidationMessage';

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
			setDurationInFrames(String(Number(e.target.value)));
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
							onChange={onDurationInFramesChanged}
							placeholder="Duration (frames)"
							name="durationInFrames"
							min={1}
							step={1}
							max={100000000}
							onValueChange={onDurationChangedDirectly}
						/>
						{compDurationErrMessage ? (
							<ValidationMessage message={compDurationErrMessage} />
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
