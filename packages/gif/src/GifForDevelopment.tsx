import {LRUMap} from 'lru_map';
import {forwardRef, useState} from 'react';
import {Canvas} from './canvas';
import type {GifState, RemotionGifProps} from './props';
import {useWorkerParser} from './react-tools';
import {useCurrentGifIndex} from './useCurrentGifIndex';

const cache = new LRUMap<string, GifState>(30);

export const GifForDevelopment = forwardRef<
	HTMLCanvasElement,
	RemotionGifProps
>(({src, width, height, onError, onLoad, fit = 'fill', ...props}, ref) => {
	const resolvedSrc = new URL(src, window.location.origin).href;
	const [state, update] = useState<GifState>(() => {
		const parsedGif = cache.get(resolvedSrc);

		if (parsedGif === undefined) {
			return {
				delays: [],
				frames: [],
				width: 0,
				height: 0,
			};
		}

		return parsedGif as GifState;
	});

	// skip loading if frames exist
	useWorkerParser(Boolean(state.frames.length) || resolvedSrc, (info) => {
		if ('error' in info) {
			if (onError) {
				onError(info.error);
			} else {
				console.error(
					'Error loading GIF:',
					info.error,
					'Handle the event using the onError() prop to make this message disappear.'
				);
			}
		} else {
			onLoad?.(info);

			cache.set(resolvedSrc, info);
			update(info);
		}
	});

	const index = useCurrentGifIndex(state.delays);

	return (
		<Canvas
			fit={fit}
			index={index}
			frames={state.frames}
			width={width ?? state.width}
			height={height ?? state.height}
			{...props}
			ref={ref}
		/>
	);
});
