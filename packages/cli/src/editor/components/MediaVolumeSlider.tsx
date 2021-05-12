import React from 'react';
import {VolumeOffIcon} from '../icons/media-volume';
import {ControlButton} from './ControlButton';

export const MediaVolumeSlider: React.FC = () => {
	return (
		<ControlButton>
			<VolumeOffIcon />
		</ControlButton>
	);
};
