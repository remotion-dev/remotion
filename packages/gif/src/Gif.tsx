import {Internals} from 'remotion';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';

export const Gif = (props: RemotionGifProps) => {
	const env = Internals.useRemotionEnvironment();
	if (env === 'rendering') {
		return <GifForRendering {...props} />;
	}

	return <GifForDevelopment {...props} />;
};
