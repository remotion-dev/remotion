import type React from 'react';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {MutedSetting} from './MutedSetting';

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

export const WebRenderModalAudio: React.FC<{
	readonly muted: boolean;
	readonly setMuted: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({muted, setMuted}) => {
	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<MutedSetting
				enforceAudioTrack={false}
				muted={muted}
				setMuted={setMuted}
			/>
		</div>
	);
};
