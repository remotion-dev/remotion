import type {RemotionOption} from '@remotion/renderer';
import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {InfoBubble} from './InfoBubble';
import {label, optionRow, rightRow} from './layout';
import {OptionExplainer} from './OptionExplainer';

export const MutedSetting: React.FC<{
	muted: boolean;
	setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	enforceAudioTrack: boolean;
	hint: RemotionOption;
}> = ({muted, setMuted, enforceAudioTrack, hint}) => {
	const onMutedChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setMuted(e.target.checked);
		},
		[setMuted]
	);

	return (
		<div style={optionRow}>
			<div style={label}>
				Muted
				<InfoBubble title="Learn more about this option">
					<OptionExplainer option={hint} />
				</InfoBubble>
			</div>

			<div style={rightRow}>
				<Checkbox
					checked={muted}
					disabled={enforceAudioTrack && !muted}
					onChange={onMutedChanged}
				/>
			</div>
		</div>
	);
};
