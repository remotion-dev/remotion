import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {label, optionRow, rightRow} from './layout';

export const EnforceAudioTrackSetting: React.FC<{
	enforceAudioTrack: boolean;
	setEnforceAudioTrack: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({enforceAudioTrack, setEnforceAudioTrack}) => {
	const onEnforceAudioTrackChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setEnforceAudioTrack(e.target.checked);
		},
		[setEnforceAudioTrack]
	);

	return (
		<div style={optionRow}>
			<div style={label}>Enforce Audio Track</div>
			<div style={rightRow}>
				<Checkbox
					checked={enforceAudioTrack}
					onChange={onEnforceAudioTrackChanged}
				/>
			</div>
		</div>
	);
};
