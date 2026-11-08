import React, {useCallback} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {validateCompositionDuration} from '../../helpers/validate-new-comp-data';
import {Spacing} from '../layout';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {InputDragger} from './InputDragger';
import {ValidationMessage} from './ValidationMessage';

const fixedDurationStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1.5,
	padding: '4px 6px',
};

export const NewCompDuration: React.FC<{
	readonly durationInFrames: number | null;
	readonly setDurationInFrames: React.Dispatch<
		React.SetStateAction<number>
	> | null;
}> = ({durationInFrames, setDurationInFrames}) => {
	const onDurationInFramesChanged = useCallback(
		(newValue: string) => {
			setDurationInFrames?.(Number(newValue));
		},
		[setDurationInFrames],
	);

	const onDurationChangedDirectly = useCallback(
		(newVal: number) => {
			setDurationInFrames?.(newVal);
		},
		[setDurationInFrames],
	);

	const compDurationErrMessage =
		setDurationInFrames === null || durationInFrames === null
			? null
			: validateCompositionDuration(durationInFrames);

	return (
		<div style={optionRow}>
			<div style={label}>Duration in frames</div>
			<div style={rightRow}>
				<InputAndValidationContainer>
					{setDurationInFrames === null ? (
						<span style={fixedDurationStyle}>{durationInFrames ?? '—'}</span>
					) : (
						<InputDragger
							onValueChangeCancel={null}
							aria-label="Duration in frames"
							type="number"
							value={durationInFrames ?? ''}
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
					)}
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
				</InputAndValidationContainer>
			</div>
		</div>
	);
};
