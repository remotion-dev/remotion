import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {label, optionRow, rightRow} from './layout';

export const MutedSetting: React.FC<{
	readonly muted: boolean;
	readonly setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	readonly enforceAudioTrack: boolean;
}> = ({muted, setMuted, enforceAudioTrack}) => {
	const onMutedChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setMuted(e.target.checked);
		},
		[setMuted],
	);

	return (
		<div style={optionRow}>
			<div style={label}>
				Muted
				<Spacing x={0.5} />
				<OptionExplainerBubble id="mutedOption" />
			</div>
			<Spacing x={0.25} />

			<div style={rightRow}>
				<Checkbox
					checked={muted}
					disabled={enforceAudioTrack && !muted}
					onChange={onMutedChanged}
					name="muted"
				/>
			</div>
		</div>
	);
};
