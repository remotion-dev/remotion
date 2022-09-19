import {forwardRef, useEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {Canvas} from './canvas';
import {gifCache} from './gif-cache';
import {isCorsError} from './is-cors-error';
import type {GifState, RemotionGifProps} from './props';
import {parseGif} from './react-tools';
import {useCurrentGifIndex} from './useCurrentGifIndex';

export const GifForRendering = forwardRef<HTMLCanvasElement, RemotionGifProps>(
	({src, width, height, onLoad, onError, fit = 'fill', ...props}, ref) => {
		const resolvedSrc = new URL(src, window.location.origin).href;
		const [state, update] = useState<GifState>(() => {
			const parsedGif = gifCache.get(resolvedSrc);

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
		const [error, setError] = useState<Error | null>(null);

		const [id] = useState(() =>
			delayRender(`Rendering <Gif/> with src="${resolvedSrc}"`)
		);

		const index = useCurrentGifIndex(state.delays);
		const currentOnLoad = useRef(onLoad);
		const currentOnError = useRef(onError);
		currentOnLoad.current = onLoad;
		currentOnError.current = onError;

		useEffect(() => {
			const controller = new AbortController();
			let done = false;
			const newHandle = delayRender('Loading <Gif /> with src=' + resolvedSrc);

			parseGif({controller, src: resolvedSrc})
				.then((parsed) => {
					currentOnLoad.current?.(parsed);
					update(parsed);
					gifCache.set(resolvedSrc, parsed);
					done = true;
					continueRender(newHandle);
					continueRender(id);
				})
				.catch((err) => {
					if (currentOnError.current) {
						currentOnError.current(err);
					} else {
						setError(err);
					}
				});

			return () => {
				if (!done) {
					controller.abort();
				}

				continueRender(newHandle);
			};
		}, [id, resolvedSrc]);

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
