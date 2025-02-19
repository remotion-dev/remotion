import {forwardRef} from 'react';
import {getRemotionEnvironment} from 'remotion';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';

/*
 * @description Displays a GIF that synchronizes with Remotions useCurrentFrame().
 * @see [Documentation](https://remotion.dev/docs/gif)
 */
export const Gif = forwardRef<HTMLCanvasElement, RemotionGifProps>(
	(props, ref) => {
		const env = getRemotionEnvironment();
		if (env.isRendering) {
			return <GifForRendering {...props} ref={ref} />;
		}

		return <GifForDevelopment {...props} ref={ref} />;
	},
);
