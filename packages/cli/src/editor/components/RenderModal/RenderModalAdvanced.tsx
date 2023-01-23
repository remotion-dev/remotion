import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import type {TComposition} from 'remotion';

import {Checkbox} from '../Checkbox';
import {FrameRangeSetting} from './FrameRangeSetting';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';

export type RenderType = 'still' | 'video' | 'audio';

export const RenderModalAdvanced: React.FC<{
	renderMode: RenderType;
	minConcurrency: number;
	maxConcurrency: number;
	setConcurrency: React.Dispatch<React.SetStateAction<number>>;
	concurrency: number;
	setVerboseLogging: React.Dispatch<React.SetStateAction<boolean>>;
	setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
	verbose: boolean;
	startFrame: number;
	currentComposition: TComposition<unknown>;
	endFrame: number;
	setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({
	renderMode,
	maxConcurrency,
	minConcurrency,
	setConcurrency,
	concurrency,
	setEndFrame,
	setVerboseLogging,
	verbose,
	startFrame,
	currentComposition,
	endFrame,
	setStartFrame,
}) => {
	const onVerboseLoggingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setVerboseLogging(e.target.checked);
		},
		[setVerboseLogging]
	);

	return (
		<div>
			{renderMode === 'still' ? null : (
				<NumberSetting
					min={minConcurrency}
					max={maxConcurrency}
					step={1}
					name="Concurrency"
					onValueChanged={setConcurrency}
					value={concurrency}
				/>
			)}

			{renderMode === 'still' ? null : (
				<FrameRangeSetting
					durationInFrames={currentComposition.durationInFrames}
					endFrame={endFrame}
					setEndFrame={setEndFrame}
					setStartFrame={setStartFrame}
					startFrame={startFrame}
				/>
			)}
			<div style={optionRow}>
				<div style={label}>Verbose logging</div>
				<div style={rightRow}>
					<Checkbox checked={verbose} onChange={onVerboseLoggingChanged} />
				</div>
			</div>
		</div>
	);
};
