import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';

import {Checkbox} from '../Checkbox';
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
	verbose: boolean;
}> = ({
	renderMode,
	maxConcurrency,
	minConcurrency,
	setConcurrency,
	concurrency,
	setVerboseLogging,
	verbose,
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
			<div style={optionRow}>
				<div style={label}>Verbose logging</div>
				<div style={rightRow}>
					<Checkbox checked={verbose} onChange={onVerboseLoggingChanged} />
				</div>
			</div>
		</div>
	);
};
