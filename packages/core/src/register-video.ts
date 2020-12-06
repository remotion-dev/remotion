import React from 'react';
import {VideoConfig} from './video-config';

let comp: React.FC | null = null;
let videoConfig: VideoConfig | null = null;

export const getVideo = (): React.FC => {
	if (!comp) {
		throw new Error('No video was set.');
	}
	return comp;
};

export const getVideoConfig = (): VideoConfig => {
	if (!videoConfig) {
		throw new Error('No video configuration was specified');
	}
	return videoConfig;
};

export const registerVideo = (
	node: React.FC<any>,
	config: VideoConfig
): void => {
	comp = node;
	videoConfig = config;
};
