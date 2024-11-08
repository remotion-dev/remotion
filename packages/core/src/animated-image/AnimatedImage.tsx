// @ts-nocheck
import {forwardRef, useEffect, useState} from 'react';
import {delayRender} from '../delay-render.js';
import {Canvas} from './canvas';
import type {RemotionAnimatedImageProps} from './props';
import {resolveAnimatedImageSource} from './resolve-image-source';

export const AnimatedImage = forwardRef<
	HTMLCanvasElement,
	RemotionAnimatedImageProps
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
			...props
		},
		ref,
	) => {
		const resolvedSrc = resolveAnimatedImageSource(src);
		const [imageDecoder, setImageDecoder] = useState<ImageDecoder | null>(null);
		const [imageIndex, setImageIndex] = useState(0);
		const [frames, setFrames] = useState<ImageData[]>([]);

		const [id] = useState(() =>
			delayRender(`Rendering <AnimatedImage/> with src="${resolvedSrc}"`),
		);

		useEffect(() => {
			if (typeof ImageDecoder === 'undefined') {
				throw new Error(
					'Your browser does not support the WebCodecs ImageDecoder API.',
				);
			}

			let aborted = false;

			fetch(resolvedSrc, {mode: 'no-cors'})
				.then((res) => res.body)
				.then((body) => {
					if (aborted) return;

					return new ImageDecoder({
						data: body,
						type: 'image/gif',
					});
				})
				.then((decoder) => {
					console.log({decoder});
					if (aborted) return;
					setImageDecoder(decoder);
					// onLoad?.();
					// continueRender(id);
				})
				.catch((err) => {
					if (aborted) return;
					onError?.(err);
				});

			return () => {
				aborted = true;
			};
		}, [resolvedSrc, id, onLoad, onError]);

		useEffect(() => {
			if (!imageDecoder) return;

			let animationFrameId: number;
			const tempCanvas = document.createElement('canvas');
			const tempCtx = tempCanvas.getContext('2d');

			const decodeNextFrame = (index: number) => {
				imageDecoder
					.decode({frameIndex: index})
					.then((result) => {
						if (tempCtx) {
							tempCanvas.width = result.image.width;
							tempCanvas.height = result.image.height;

							console.log({result});

							tempCtx.drawImage(result.image, 0, 0);
							const imageData = tempCtx.getImageData(
								0,
								0,
								// result.image.displayWidth,
								result.image.displayHeight,
							);
							setFrames((prev) => [...prev, imageData]);
						}

						const track = imageDecoder.tracks.selectedTrack;

						if (imageDecoder.complete) {
							if (track.frameCount === 1) return;

							if (index + 1 >= track.frameCount) {
								if (loopBehavior === 'loop') {
									setImageIndex(0);
								} else {
									return;
								}
							} else {
								setImageIndex((prev) => prev + 1);
							}
						}

						animationFrameId = requestAnimationFrame(() => {
							decodeNextFrame((index + 1) % track.frameCount);
						});
					})
					.catch((e) => {
						if (e instanceof RangeError) {
							setImageIndex(0);
							decodeNextFrame(0);
						} else {
							throw e;
						}
					});
			};

			decodeNextFrame(imageIndex);

			return () => {
				if (animationFrameId) {
					cancelAnimationFrame(animationFrameId);
				}
			};
		}, [imageDecoder, imageIndex, loopBehavior, playbackRate]);

		return (
			<Canvas
				ref={ref}
				index={imageIndex}
				frames={frames}
				width={width}
				height={height}
				fit={fit}
				{...props}
			/>
		);
	},
);
