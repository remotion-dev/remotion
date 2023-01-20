import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';
import {Checkbox} from '../Checkbox';
import {label, optionRow, rightRow} from './layout';

export const MutedSetting: React.FC<{
	muted: boolean;
	setMuted: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({muted, setMuted}) => {
	const onMutedChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setMuted(e.target.checked);
		},
		[setMuted]
	);

	return (
		<div style={optionRow}>
			<div style={label}>Muted</div>
			<div style={rightRow}>
				<Checkbox checked={muted} onChange={onMutedChanged} />
			</div>
		</div>
	);
};
