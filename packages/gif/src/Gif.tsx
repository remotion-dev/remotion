import React from 'react';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import {RemotionGifProps} from './props';

export const Gif = (props: RemotionGifProps) => {
	if (process.env.NODE_ENV === 'development') {
		return <GifForDevelopment {...props} />;
	}

	return <GifForRendering {...props} />;
};
