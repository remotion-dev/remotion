import React, {useCallback} from 'react';
import {Internals} from 'remotion';
import {VolumeOffIcon, VolumeOnIcon} from '../icons/media-volume';
import {ControlButton} from './ControlButton';

export const MediaVolumeSlider: React.FC = () => {
	const [mediaMuted, setMediaMuted] = Internals.useMediaMutedState();
	const [mediaVolume, setMediaVolume] = Internals.useMediaVolumeState();
	console.log(mediaVolume, 'media volume');

	const onClick = useCallback(() => {
		setMediaMuted(!mediaMuted);
	}, [setMediaMuted, mediaMuted]);

	return (
		<ControlButton onClick={onClick}>
			{mediaMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
		</ControlButton>
	);
};
