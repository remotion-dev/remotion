import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {NumberOfLoopsSetting} from './NumberOfLoopsSetting';
import {NumberSetting} from './NumberSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {label, optionRow, rightRow} from './layout';

const container: React.CSSProperties = {
	flex: 1,
};

export const RenderModalGif: React.FC<{
	readonly limitNumberOfGifLoops: boolean;
	readonly setLimitNumberOfGifLoops: (
		value: React.SetStateAction<boolean>,
	) => void;
	readonly numberOfGifLoopsSetting: number;
	readonly setNumberOfGifLoopsSetting: React.Dispatch<
		React.SetStateAction<number>
	>;
	readonly everyNthFrame: number;
	readonly setEveryNthFrameSetting: React.Dispatch<
		React.SetStateAction<number>
	>;
}> = ({
	everyNthFrame,
	limitNumberOfGifLoops,
	numberOfGifLoopsSetting,
	setEveryNthFrameSetting,
	setLimitNumberOfGifLoops,
	setNumberOfGifLoopsSetting,
}) => {
	const onShouldLimitNumberOfGifLoops = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setLimitNumberOfGifLoops(e.target.checked);
		},
		[setLimitNumberOfGifLoops],
	);

	return (
		<div style={container}>
			<NumberSetting
				name="Every nth frame"
				min={1}
				onValueChanged={setEveryNthFrameSetting}
				value={everyNthFrame}
				step={1}
			/>
			<div style={optionRow}>
				<div style={label}>
					Limit GIF loops <Spacing x={0.5} />
					<OptionExplainerBubble id="numberOfGifLoopsOption" />
				</div>
				<div style={rightRow}>
					<Checkbox
						checked={limitNumberOfGifLoops}
						onChange={onShouldLimitNumberOfGifLoops}
						name="limitNumberOfGifLoops"
					/>
				</div>
			</div>
			{limitNumberOfGifLoops ? (
				<NumberOfLoopsSetting
					numberOfGifLoops={numberOfGifLoopsSetting}
					setNumberOfGifLoops={setNumberOfGifLoopsSetting}
				/>
			) : null}
		</div>
	);
};
