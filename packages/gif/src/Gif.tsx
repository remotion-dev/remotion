import {Internals} from 'remotion';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';

export const Gif = (props: RemotionGifProps) => {
	if (Internals.getRemotionEnvironment() === 'rendering') {
		return <GifForRendering {...props} />;
	}

	return <GifForDevelopment {...props} />;
};
