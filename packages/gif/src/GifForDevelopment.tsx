/* eslint-disable no-console */
import {forwardRef, useEffect, useRef, useState, type RefObject} from 'react';
import type {EffectDefinitionAndStack} from 'remotion';
import {Canvas} from './canvas';
import {manuallyManagedGifCache, volatileGifCache} from './gif-cache';
import {isCorsError} from './is-cors-error';
import type {GifState, RemotionGifProps} from './props';
import {parseWithWorker} from './react-tools';
import {getGifCacheKey} from './request-init';
import {resolveGifSource} from './resolve-gif-source';
import {useCurrentGifIndex} from './useCurrentGifIndex';

export const GifForDevelopment = forwardRef<
	HTMLCanvasElement,
	RemotionGifProps & {
		readonly effects: EffectDefinitionAndStack<unknown>[];
		readonly refForOutline: RefObject<HTMLElement | null>;
	}
>(
	(
		{
			src,
			width,
			height,
			onError,
			loopBehavior = 'loop',
			playbackRate = 1,
			onLoad,
			fit = 'fill',
			requestInit,
			effects,
			refForOutline,
			...props
		},
		ref,
	) => {
		const resolvedSrc = resolveGifSource(src);
		const requestInitRef = useRef(requestInit);
		requestInitRef.current = requestInit;
		const cacheKey = getGifCacheKey({resolvedSrc, requestInit});
		const [state, update] = useState<GifState>(() => {
			const parsedGif =
				volatileGifCache.get(cacheKey) ?? manuallyManagedGifCache.get(cacheKey);

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

		const currentOnLoad = useRef(onLoad);
		const currentOnError = useRef(onError);
		currentOnLoad.current = onLoad;
		currentOnError.current = onError;

		useEffect(() => {
			const parsedGif =
				volatileGifCache.get(cacheKey) ?? manuallyManagedGifCache.get(cacheKey);
			if (parsedGif !== undefined) {
				update(parsedGif as GifState);
				currentOnLoad.current?.(parsedGif as GifState);
				return;
			}

			let done = false;
			let aborted = false;
			const {prom, cancel} = parseWithWorker({
				src: resolvedSrc,
				cacheKey,
				requestInit: requestInitRef.current,
			});

			prom
				.then((parsed) => {
					currentOnLoad.current?.(parsed);
					update(parsed);
					volatileGifCache.set(cacheKey, parsed);
					done = true;
				})
				.catch((err) => {
					if (aborted) {
						return;
					}

					if (currentOnError.current) {
						currentOnError.current(err);
					} else {
						setError(err);
					}
				});

			return () => {
				if (!done) {
					aborted = true;
					cancel();
				}
			};
		}, [cacheKey, resolvedSrc]);

		if (error) {
			console.error(error.stack);
			if (isCorsError(error)) {
				throw new Error(
					`Failed to render GIF with source ${src}: "${error.message}". You must enable CORS for this URL. Open the Developer Tools to see exactly why this fetch failed.`,
				);
			}

			throw new Error(
				`Failed to render GIF with source ${src}: "${error.message}".`,
			);
		}

		const index = useCurrentGifIndex({
			delays: state.delays,
			loopBehavior,
			playbackRate,
		});

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
				refForOutline={refForOutline}
				{...props}
				ref={ref}
			/>
		);
	},
);
