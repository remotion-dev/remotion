import {Canvas, useParser} from '@react-gifs/tools';
import {forwardRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {isCorsError} from './is-cors-error';
import type {GifState, RemotionGifProps} from './props';
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
		const [error, setError] = useState<Error | null>(null);

		const [id] = useState(() =>
			delayRender(`Rendering <Gif/> with src="${resolvedSrc}"`)
		);

		const index = useCurrentGifIndex(state.delays);

		useParser(resolvedSrc, (info) => {
			if ('error' in info) {
				if (onError) {
					onError(info.error);
				} else {
					setError(info.error);
				}
			} else {
				onLoad?.(info);
				update(info);
			}

			continueRender(id);
		});

		if (error) {
			console.error(error.stack);
			if (isCorsError(error)) {
				throw new Error(
					`Failed to render GIF with source ${src}: "${error.message}". You must enable CORS for this URL.`
				);
			}

			throw new Error(
				`Failed to render GIF with source ${src}: "${error.message}". Render with --log=verbose to see the full stack.`
			);
		}

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
