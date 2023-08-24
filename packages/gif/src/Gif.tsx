import {forwardRef} from 'react';
import {Internals} from 'remotion';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';

/**
 * @description Displays a GIF that synchronizes with Remotions useCurrentFrame().
 * @see [Documentation](https://www.remotion.dev/docs/gif/gif)
 */
export const Gif = forwardRef<HTMLCanvasElement, RemotionGifProps>(
	(props, ref) => {
		const env = Internals.useRemotionEnvironment();
		if (env === 'rendering') {
			return <GifForRendering {...props} ref={ref} />;
		}

		return <GifForDevelopment {...props} ref={ref} />;
	},
);
