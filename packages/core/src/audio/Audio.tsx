import React from 'react';
import {AudioForDevelopment} from './AudioForDevelopment';
import {RemotionAudioProps} from './props';

export const Audio: React.FC<RemotionAudioProps> = (props) => {
	if (process.env.NODE_ENV === 'development') {
		return <AudioForDevelopment {...props} />;
	}
	return null;
};
