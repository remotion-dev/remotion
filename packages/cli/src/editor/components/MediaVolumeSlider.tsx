import React, {useCallback} from 'react';
import {Internals} from 'remotion';
import {VolumeOffIcon, VolumeOnIcon} from '../icons/media-volume';
import {ControlButton} from './ControlButton';

export const MediaVolumeSlider: React.FC = () => {
	const [mediaMuted, setMediaMuted] = Internals.useMediaMutedState();
	const [mediaVolume, setMediaVolume] = Internals.useMediaVolumeState();
	console.log(mediaVolume);

	const onClick = useCallback(() => {
		setMediaMuted(!mediaMuted);
		setMediaVolume(Number(mediaMuted));
	}, [setMediaMuted, mediaMuted, setMediaVolume]);

	return (
		<ControlButton onClick={onClick}>
			{mediaMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
		</ControlButton>
	);
};
