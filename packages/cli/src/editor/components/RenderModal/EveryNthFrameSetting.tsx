import React, {useCallback} from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import {label, optionRow, rightRow} from './layout';

export const EveryNthFrameSetting: React.FC<{
	everyNthFrame: number;
	setEveryNthFrameSetting: React.Dispatch<React.SetStateAction<number>>;
}> = ({everyNthFrame, setEveryNthFrameSetting}) => {
	const onEveryNthFrameChangedDirectly = useCallback(
		(newConcurrency: number) => {
			setEveryNthFrameSetting(newConcurrency);
		},
		[setEveryNthFrameSetting]
	);

	const onConcurrencyChanged = useCallback(
		(e: string) => {
			setEveryNthFrameSetting((q) => {
				const newEveryNthFrameSetting = parseInt(e, 10);
				if (Number.isNaN(newEveryNthFrameSetting)) {
					return q;
				}

				const newConcurrencyClamped = Math.max(newEveryNthFrameSetting, 1);
				return newConcurrencyClamped;
			});
		},
		[setEveryNthFrameSetting]
	);

	return (
		<div style={optionRow}>
			<div style={label}>Every nth frame</div>
			<div style={rightRow}>
				<RightAlignInput>
					<InputDragger
						value={everyNthFrame}
						onTextChange={onConcurrencyChanged}
						placeholder={`1-`}
						onValueChange={onEveryNthFrameChangedDirectly}
						name="every-nth-frame"
						step={1}
						min={1}
					/>
				</RightAlignInput>
			</div>
		</div>
	);
};
