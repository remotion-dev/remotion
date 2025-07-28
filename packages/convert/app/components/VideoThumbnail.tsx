import clsx from 'clsx';
import {FastAverageColor} from 'fast-average-color';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import {useIsNarrow} from '~/lib/is-narrow';

export const THUMBNAIL_HEIGHT = Math.round((350 / 16) * 9);

type Props = {
	readonly smallThumbOnMobile: boolean;
	readonly userRotation: number;
	readonly trackRotation: number | null;
	readonly mirrorHorizontal: boolean;
	readonly mirrorVertical: boolean;
	readonly initialReveal: boolean;
};

export type VideoThumbnailRef = {
	draw: (videoFrame: VideoFrame) => void;
	onDone: () => void;
	copy: () => Promise<ImageBitmap>;
	hasBitmap: boolean;
	addOnChangeListener: (listener: () => void) => void;
	removeOnChangeListener: (listener: () => void) => void;
};

const VideoThumbnailRefForward: React.ForwardRefRenderFunction<
	VideoThumbnailRef,
	Props
> = (
	{
		smallThumbOnMobile,
		userRotation,
		trackRotation,
		mirrorHorizontal,
		mirrorVertical,
		initialReveal,
	},
	forwardedRef,
) => {
	const ref = useRef<HTMLCanvasElement>(null);

	const [color, setColor] = useState<string>('transparent');
	const [dimensions, setDimensions] = useState<{width: number}>({width: 350});
	const [reveal, setReveal] = useState(initialReveal);
	const [drawn, setDrawn] = useState(false);
	const [needsRotation, setNeedsRotation] = useState(false);

	const onChangeListeners = useRef<(() => void)[]>([]);

	const drawThumbnail = useCallback((unrotatedVideoFrame: VideoFrame) => {
		const scaleRatio = THUMBNAIL_HEIGHT / unrotatedVideoFrame.displayHeight;
		const w = Math.round(unrotatedVideoFrame.displayWidth * scaleRatio);
		setDimensions({width: w});

		const canvas = ref.current;
		if (!canvas) {
			return;
		}

		canvas.width = w;
		const twoDContext = canvas.getContext('2d');
		if (!twoDContext) {
			return;
		}

		twoDContext.drawImage(unrotatedVideoFrame, 0, 0, w, THUMBNAIL_HEIGHT);
		setColor((c) => {
			if (c !== 'transparent') {
				return c;
			}

			return new FastAverageColor().getColor(canvas).hex;
		});
		setDrawn(true);
		setNeedsRotation(!('rotation' in unrotatedVideoFrame));
	}, []);

	useImperativeHandle(
		forwardedRef,
		() => ({
			draw: drawThumbnail,
			onDone: () => {
				onChangeListeners.current.forEach((l) => l());
				setReveal(true);
			},
			copy: () => {
				const canvas = ref.current;
				if (!canvas) {
					throw new Error('Canvas not ready');
				}

				return createImageBitmap(canvas);
			},
			addOnChangeListener(listener) {
				onChangeListeners.current.push(listener);
			},
			removeOnChangeListener(listener) {
				onChangeListeners.current = onChangeListeners.current.filter(
					(l) => l !== listener,
				);
			},
			hasBitmap: drawn,
		}),
		[drawThumbnail, drawn],
	);

	const isNarrow = useIsNarrow();

	const scale = isNarrow && smallThumbOnMobile ? 0.5 : 1;

	const rotation =
		userRotation - (needsRotation ? 0 - (trackRotation ?? 0) : 0);

	const scaleTransform =
		rotation % 90 === 0 && rotation % 180 !== 0
			? THUMBNAIL_HEIGHT / dimensions.width
			: 1;

	return (
		<div
			className={clsx(
				isNarrow && smallThumbOnMobile ? 'border-r-2' : 'border-b-2',
				'border-black overflow-hidden bg-slate-100',
			)}
			// +2 to account for border
			style={{height: THUMBNAIL_HEIGHT * scale + 2}}
		>
			<div
				className="flex justify-center transition-opacity"
				style={{backgroundColor: color, opacity: reveal && drawn ? 1 : 0}}
			>
				<canvas
					ref={ref}
					height={THUMBNAIL_HEIGHT}
					style={{
						maxHeight: THUMBNAIL_HEIGHT * scale,
						width: dimensions.width * scale,
						transform: `scale(${scaleTransform * (mirrorHorizontal ? -1 : 1)}, ${scaleTransform * (mirrorVertical ? -1 : 1)}) rotate(${rotation}deg)`,
						transition: 'transform 0.3s',
					}}
				/>
			</div>
		</div>
	);
};

export const VideoThumbnail = React.forwardRef(VideoThumbnailRefForward);
