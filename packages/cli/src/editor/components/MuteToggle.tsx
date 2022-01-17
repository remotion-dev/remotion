import {useIsStill} from '../helpers/is-current-selected-still';
import {useCallback} from 'react';
import {VolumeOffIcon, VolumeOnIcon} from '../icons/media-volume';
import {persistMuteOption} from '../state/mute';
import {ControlButton} from './ControlButton';

const accessibilityLabel = 'Mute player';

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

	const isStill = useIsStill();

	if (isStill) {
		return null;
	}

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
