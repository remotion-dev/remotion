import React from 'react';
import {RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

export const Video: React.FC<RemotionVideoProps> = (props) => {
	if (process.env.NODE_ENV === 'development') {
		return <VideoForDevelopment {...props} />;
	}
	return <VideoForRendering {...props} />;
};
