import {Canvas, useParser} from '@react-gifs/tools';
import {forwardRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {GifState, RemotionGifProps} from './props';
import {useCurrentGifIndex} from './useCurrentGifIndex';

export const GifForRendering = forwardRef<HTMLCanvasElement, RemotionGifProps>(
	({src, width, height, onLoad, onError, fit = 'fill', ...props}, ref) => {
		const resolvedSrc = new URL(src, window.location.origin).href;
		const [state, update] = useState<GifState>({
			delays: [],
			frames: [],
			width: 0,
			height: 0,
		});

		const [id] = useState(() =>
			delayRender(`Rendering <Gif/> with src="${resolvedSrc}"`)
		);

		const index = useCurrentGifIndex(state.delays);

		useParser(resolvedSrc, (info) => {
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
				update(info);
			}

			continueRender(id);
		});

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
	}
);
