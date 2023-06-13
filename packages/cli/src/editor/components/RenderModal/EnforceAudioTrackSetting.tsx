import type {RemotionOption} from '@remotion/renderer';
import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {InfoBubble} from './InfoBubble';
import {label, optionRow, rightRow} from './layout';
import {OptionExplainer} from './OptionExplainer';

export const EnforceAudioTrackSetting: React.FC<{
	enforceAudioTrack: boolean;
	setEnforceAudioTrack: React.Dispatch<React.SetStateAction<boolean>>;
	muted: boolean;
	option: RemotionOption;
}> = ({enforceAudioTrack, muted, setEnforceAudioTrack, option}) => {
	const onEnforceAudioTrackChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setEnforceAudioTrack(e.target.checked);
		},
		[setEnforceAudioTrack]
	);

	return (
		<div style={optionRow}>
			<div style={label}>
				Enforce Audio Track
				<Spacing x={0.5} />
				<InfoBubble title="Learn more about this option">
					<OptionExplainer option={option} />
				</InfoBubble>
			</div>

			<div style={rightRow}>
				<Checkbox
					disabled={muted && !enforceAudioTrack}
					checked={enforceAudioTrack}
					onChange={onEnforceAudioTrackChanged}
					name="enforce-audio-track"
				/>
			</div>
		</div>
	);
};
