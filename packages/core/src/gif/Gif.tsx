import React from 'react';
import {RemotionGifProps} from './props';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';

export const Gif = (props: RemotionGifProps) => {
	if (process.env.NODE_ENV === 'development') {
		return <GifForDevelopment {...props} />;
	}
	return <GifForRendering {...props} />;
};
