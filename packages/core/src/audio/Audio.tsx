import React from 'react';
import {AudioForDevelopment} from './AudioForDevelopment';
import {AllowedAudioProps} from './props';

export const Audio: React.FC<AllowedAudioProps> = (props) => {
	if (process.env.NODE_ENV === 'development') {
		return <AudioForDevelopment {...props} />;
	}
	return null;
};
