import React, {useCallback} from 'react';
import {validateCompositionDuration} from '../../helpers/validate-new-comp-data';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {Spacing} from '../layout';
import {InputDragger} from './InputDragger';
import {ValidationMessage} from './ValidationMessage';

export const NewCompDuration: React.FC<{
	readonly durationInFrames: number;
	readonly setDurationInFrames: React.Dispatch<React.SetStateAction<number>>;
}> = ({durationInFrames, setDurationInFrames}) => {
	const onDurationInFramesChanged = useCallback(
		(newValue: string) => {
			setDurationInFrames(Number(newValue));
		},
		[setDurationInFrames],
	);

	const onDurationChangedDirectly = useCallback(
		(newVal: number) => {
			setDurationInFrames(newVal);
		},
		[setDurationInFrames],
	);

	const compDurationErrMessage = validateCompositionDuration(durationInFrames);

	return (
		<div style={optionRow}>
			<div style={label}>Duration in frames</div>
			<div style={rightRow}>
				<InputDragger
					type="number"
					value={durationInFrames}
					onTextChange={onDurationInFramesChanged}
					placeholder="Duration (frames)"
					name="durationInFrames"
					min={1}
					step={1}
					required
					status="ok"
					// Hitting Promise.all() limit in Chrome
					max={300_000}
					onValueChange={onDurationChangedDirectly}
					rightAlign={false}
				/>
				{compDurationErrMessage ? (
					<>
						<Spacing y={1} block />
						<ValidationMessage
							align="flex-start"
							message={compDurationErrMessage}
							type="error"
						/>
					</>
				) : null}
			</div>
		</div>
	);
};
