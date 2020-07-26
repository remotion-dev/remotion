import React from 'react';
import {AllowedVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

export const Video: React.FC<AllowedVideoProps> = (props) => {
	if (process.env.NODE_ENV === 'development') {
		return <VideoForDevelopment {...props} />;
	}
	return <VideoForRendering {...props} />;
};
