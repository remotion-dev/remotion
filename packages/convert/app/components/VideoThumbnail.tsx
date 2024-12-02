import {FastAverageColor} from 'fast-average-color';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import {useIsNarrow} from '~/lib/is-narrow';

const THUMBNAIL_HEIGHT = Math.round((350 / 16) * 9);

type Props = {
	readonly smallThumbOnMobile: boolean;
	readonly rotation: number;
};

export type VideoThumbnailRef = {
	draw: (videoFrame: VideoFrame) => void;
};

const VideoThumbnailRefForward: React.ForwardRefRenderFunction<
	VideoThumbnailRef,
	Props
> = ({smallThumbOnMobile, rotation}, forwardedRef) => {
	const ref = useRef<HTMLCanvasElement>(null);

	const [color, setColor] = useState<string>('transparent');
	const [dimensions, setDimensions] = useState<{width: number}>({width: 0});

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
	}, []);

	useImperativeHandle(
		forwardedRef,
		() => ({
			draw: drawThumbnail,
		}),
		[drawThumbnail],
	);

	const isNarrow = useIsNarrow();

	const scale = isNarrow && smallThumbOnMobile ? 0.5 : 1;
	const scaleTransform =
		rotation % 90 === 0 && rotation % 180 !== 0
			? THUMBNAIL_HEIGHT / dimensions.width
			: 1;

	return (
		<div
			className="border-b-2 border-black overflow-hidden"
			// +2 to account for border
			style={{height: THUMBNAIL_HEIGHT * scale + 2}}
		>
			<div className="flex justify-center" style={{backgroundColor: color}}>
				<canvas
					ref={ref}
					height={THUMBNAIL_HEIGHT}
					style={{
						maxHeight: THUMBNAIL_HEIGHT * scale,
						width: dimensions.width * scale,
						rotate: `${String(rotation)}deg`,
						scale: String(scaleTransform),
						transition: 'rotate 0.3s, scale 0.3s',
					}}
				/>
			</div>
		</div>
	);
};

export const VideoThumbnail = React.forwardRef(VideoThumbnailRefForward);
