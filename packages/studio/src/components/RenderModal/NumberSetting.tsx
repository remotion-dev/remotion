import type {AvailableOptions} from '@remotion/renderer/client';
import React, {useCallback} from 'react';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import {Spacing} from '../layout';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {label, optionRow, rightRow} from './layout';

export const NumberSetting: React.FC<{
	readonly name: string;
	readonly value: number;
	readonly onValueChanged: React.Dispatch<React.SetStateAction<number>>;
	readonly max?: number;
	readonly min: number;
	readonly step: number;
	readonly formatter?: (value: string | number) => string;
	readonly hint?: AvailableOptions;
}> = ({name, value, step, hint, onValueChanged, max, min, formatter}) => {
	const onTextChanged = useCallback(
		(e: string) => {
			onValueChanged((q) => {
				const newSetting = step < 1 ? parseFloat(e) : parseInt(e, 10);
				if (Number.isNaN(newSetting)) {
					return q;
				}

				return Math.min(max ?? Infinity, Math.max(newSetting, min));
			});
		},
		[max, min, onValueChanged, step],
	);

	const onValueChange = useCallback(
		(newConcurrency: number) => {
			onValueChanged(newConcurrency);
		},
		[onValueChanged],
	);

	return (
		<div style={optionRow}>
			<div style={label}>
				{name}
				{hint ? (
					<>
						<Spacing x={0.5} />
						<OptionExplainerBubble id={hint} />
					</>
				) : null}
			</div>
			<div style={rightRow}>
				<RightAlignInput>
					<InputDragger
						value={value}
						name={name.toLowerCase()}
						onTextChange={onTextChanged}
						onValueChange={onValueChange}
						step={step}
						placeholder={[min, max]
							.map((f) => (f !== null && f !== undefined ? f : ''))
							.join('-')}
						min={min}
						max={max}
						formatter={formatter}
						status="ok"
						rightAlign
					/>
				</RightAlignInput>
			</div>
		</div>
	);
};
