import {forwardRef, useEffect, useRef, useState} from 'react';
import {Internals, useDelayRender} from 'remotion';
import type {EffectDefinitionAndStack} from 'remotion';
import {Canvas} from './canvas';
import {volatileGifCache} from './gif-cache';
import {isCorsError} from './is-cors-error';
import type {GifState, RemotionGifProps} from './props';
import {parseGif} from './react-tools';
import {getGifCacheKey} from './request-init';
import {resolveGifSource} from './resolve-gif-source';
import {useCurrentGifIndex} from './useCurrentGifIndex';

export const GifForRendering = forwardRef<
	HTMLCanvasElement,
	RemotionGifProps & {
		readonly effects: EffectDefinitionAndStack<unknown>[];
	}
>(
	(
		{
			src,
			width,
			height,
			onLoad,
			onError,
			loopBehavior = 'loop',
			playbackRate = 1,
			fit = 'fill',
			delayRenderTimeoutInMilliseconds,
			requestInit,
			effects,
			...props
		},
		ref,
	) => {
		const resolvedSrc = resolveGifSource(src);
		const requestInitRef = useRef(requestInit);
		requestInitRef.current = requestInit;
		const cacheKey = getGifCacheKey({resolvedSrc, requestInit});
		const {delayRender, continueRender} = useDelayRender();
		const [state, update] = useState<GifState>(() => {
			const parsedGif = volatileGifCache.get(cacheKey);

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

		const [renderHandle] = useState(() =>
			delayRender(`Rendering <Gif/> with src="${resolvedSrc}"`, {
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			}),
		);

		const logLevel = Internals.useLogLevel();

		useEffect(() => {
			return () => {
				continueRender(renderHandle);
			};
		}, [renderHandle, continueRender]);

		const index = useCurrentGifIndex({
			delays: state.delays,
			loopBehavior,
			playbackRate,
		});
		const currentOnLoad = useRef(onLoad);
		const currentOnError = useRef(onError);
		currentOnLoad.current = onLoad;
		currentOnError.current = onError;

		useEffect(() => {
			const controller = new AbortController();
			let done = false;
			let aborted = false;
			const newHandle = delayRender('Loading <Gif /> with src=' + resolvedSrc, {
				timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
			});

			Internals.Log.verbose(
				{logLevel, tag: null},
				'Loading GIF with source',
				resolvedSrc,
			);
			const time = Date.now();
			parseGif({
				controller,
				src: resolvedSrc,
				requestInit: requestInitRef.current,
			})
				.then((parsed) => {
					Internals.Log.verbose(
						{logLevel, tag: null},
						'Parsed GIF in',
						Date.now() - time,
						'ms',
					);
					currentOnLoad.current?.(parsed);
					update(parsed);
					volatileGifCache.set(cacheKey, parsed);
					done = true;
					continueRender(newHandle);
					continueRender(renderHandle);
				})
				.catch((err) => {
					if (aborted) {
						continueRender(newHandle);
						return;
					}

					Internals.Log.error({logLevel, tag: null}, 'Failed to load GIF', err);

					if (currentOnError.current) {
						currentOnError.current(err);
					} else {
						setError(err);
					}
				});

			return () => {
				if (!done) {
					aborted = true;
					controller.abort();
				}

				continueRender(newHandle);
				continueRender(renderHandle);
			};
		}, [
			renderHandle,
			logLevel,
			cacheKey,
			resolvedSrc,
			delayRender,
			continueRender,
			delayRenderTimeoutInMilliseconds,
		]);

		if (error) {
			Internals.Log.error({logLevel, tag: null}, error.stack);
			if (isCorsError(error)) {
				throw new Error(
					`Failed to render GIF with source ${src}: "${error.message}". You must enable CORS for this URL.`,
				);
			}

			throw new Error(
				`Failed to render GIF with source ${src}: "${error.message}". Render with --log=verbose to see the full stack.`,
			);
		}

		if (index === -1) {
			return null;
		}

		return (
			<Canvas
				fit={fit}
				index={index}
				frames={state.frames}
				width={width}
				height={height}
				effects={effects}
				{...props}
				ref={ref}
			/>
		);
	},
);
