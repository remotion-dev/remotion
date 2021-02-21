import React from 'react';
import {AudioForDevelopment} from './AudioForDevelopment';
import {AudioForRendering} from './AudioForRendering';
import {RemotionAudioProps} from './props';

export const Audio: React.FC<RemotionAudioProps> = (props) => {
	if (process.env.NODE_ENV === 'development') {
		return <AudioForDevelopment {...props} />;
	}
	return <AudioForRendering {...props} />;
};
