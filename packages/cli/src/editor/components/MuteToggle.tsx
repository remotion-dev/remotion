import {useCallback} from 'react';
import {VolumeOffIcon, VolumeOnIcon} from '../icons/media-volume';
import {persistMuteOption} from '../state/mute';
import {ControlButton} from './ControlButton';

export const MuteToggle: React.FC<{
	muted: boolean;
	setMuted: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({muted, setMuted}) => {
	const onClick = useCallback(() => {
		setMuted((m) => {
			persistMuteOption(!m);
			return !m;
		});
	}, [setMuted]);
	const accessibilityLabel = muted ? 'Unmute video' : 'Mute video';

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			onClick={onClick}
		>
			{muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
		</ControlButton>
	);
};
