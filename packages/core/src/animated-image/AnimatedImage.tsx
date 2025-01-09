import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {cancelRender} from '../cancel-render.js';
import {continueRender, delayRender} from '../delay-render.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useVideoConfig} from '../use-video-config.js';
import type {AnimatedImageCanvasRef} from './canvas';
import {Canvas} from './canvas';
import type {RemotionImageDecoder} from './decode-image.js';
import {decodeImage} from './decode-image.js';
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
			fit = 'fill',
			...props
		},
		canvasRef,
	) => {
		const mountState = useRef({isMounted: true});

		useEffect(() => {
			const {current} = mountState;
			current.isMounted = true;
			return () => {
				current.isMounted = false;
			};
		}, []);

		const resolvedSrc = resolveAnimatedImageSource(src);
		const [imageDecoder, setImageDecoder] =
			useState<RemotionImageDecoder | null>(null);

		const [decodeHandle] = useState(() =>
			delayRender(`Rendering <AnimatedImage/> with src="${resolvedSrc}"`),
		);

		const frame = useCurrentFrame();
		const {fps} = useVideoConfig();
		const currentTime = frame / playbackRate / fps;
		const currentTimeRef = useRef<number>(currentTime);
		currentTimeRef.current = currentTime;

		const ref = useRef<AnimatedImageCanvasRef>(null);

		useImperativeHandle(canvasRef, () => {
			const c = ref.current?.getCanvas();
			if (!c) {
				throw new Error('Canvas ref is not set');
			}

			return c;
		}, []);

		const [initialLoopBehavior] = useState(() => loopBehavior);

		useEffect(() => {
			const controller = new AbortController();
			decodeImage({
				resolvedSrc,
				signal: controller.signal,
				currentTime: currentTimeRef.current,
				initialLoopBehavior,
			})
				.then((d) => {
					setImageDecoder(d);
					continueRender(decodeHandle);
				})
				.catch((err) => {
					if ((err as Error).name === 'AbortError') {
						continueRender(decodeHandle);

						return;
					}

					if (onError) {
						onError?.(err as Error);
						continueRender(decodeHandle);
					} else {
						cancelRender(err);
					}
				});

			return () => {
				controller.abort();
			};
		}, [resolvedSrc, decodeHandle, onError, initialLoopBehavior]);

		useLayoutEffect(() => {
			if (!imageDecoder) {
				return;
			}

			const delay = delayRender(
				`Rendering frame at ${currentTime} of <AnimatedImage src="${src}"/>`,
			);

			imageDecoder
				.getFrame(currentTime, loopBehavior)
				.then((videoFrame) => {
					if (mountState.current.isMounted) {
						if (videoFrame === null) {
							ref.current?.clear();
						} else {
							ref.current?.draw(videoFrame.frame!);
						}
					}

					continueRender(delay);
				})
				.catch((err) => {
					if (onError) {
						onError(err as Error);
						continueRender(delay);
					} else {
						cancelRender(err);
					}
				});
		}, [currentTime, imageDecoder, loopBehavior, onError, src]);

		return (
			<Canvas ref={ref} width={width} height={height} fit={fit} {...props} />
		);
	},
);
