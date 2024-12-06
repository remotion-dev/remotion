import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import {cancelRender} from '../cancel-render.js';
import {delayRender} from '../delay-render.js';
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
			onLoad,
			fit = 'fill',
			...props
		},
		canvasRef,
	) => {
		const resolvedSrc = resolveAnimatedImageSource(src);
		const [imageDecoder, setImageDecoder] =
			useState<RemotionImageDecoder | null>(null);

		const [id] = useState(() =>
			delayRender(`Rendering <AnimatedImage/> with src="${resolvedSrc}"`),
		);

		const frame = useCurrentFrame();
		const {fps} = useVideoConfig();
		const currentTime = frame / fps;
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

		useEffect(() => {
			const controller = new AbortController();
			decodeImage({
				resolvedSrc,
				signal: controller.signal,
				currentTime: currentTimeRef.current,
			})
				.then((d) => {
					setImageDecoder(d);
				})
				.catch((err) => {
					if ((err as Error).name === 'AbortError') {
						return;
					}

					// TODO: Allow to catch error
					cancelRender(err);
				});

			return () => {
				controller.abort();
			};
		}, [resolvedSrc, id, onLoad, onError]);

		useEffect(() => {
			if (!imageDecoder) {
				return;
			}

			imageDecoder.getFrame(currentTime).then((videoFrame) => {
				ref.current?.draw(videoFrame.frame!);
			});
		}, [currentTime, imageDecoder]);

		return (
			<Canvas ref={ref} width={width} height={height} fit={fit} {...props} />
		);
	},
);
