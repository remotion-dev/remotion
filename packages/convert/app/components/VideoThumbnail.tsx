import {FastAverageColor} from 'fast-average-color';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';

const THUMBNAIL_HEIGHT = Math.round((350 / 16) * 9);

export type VideoThumbnailRef = {
	draw: (videoFrame: VideoFrame) => void;
};

const VideoThumbnailRefForward: React.ForwardRefRenderFunction<
	VideoThumbnailRef
> = (_props, forwardedRef) => {
	const ref = useRef<HTMLCanvasElement>(null);

	const [color, setColor] = useState<string>('transparent');
	const [width, setWidth] = useState<number>(0);

	const drawThumbnail = useCallback((videoFrame: VideoFrame) => {
		const scaleRatio = THUMBNAIL_HEIGHT / videoFrame.displayHeight;
		const w = Math.round(videoFrame.displayWidth * scaleRatio);
		setWidth(w);

		const canvas = ref.current;
		if (!canvas) {
			return;
		}
		canvas.width = w;
		const twoDContext = canvas.getContext('2d');
		if (!twoDContext) {
			return;
		}

		twoDContext.drawImage(videoFrame, 0, 0, w, THUMBNAIL_HEIGHT);
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

	return (
		<div className="border-b-2 border-black" style={{height: THUMBNAIL_HEIGHT}}>
			<div className="flex justify-center" style={{backgroundColor: color}}>
				<canvas
					ref={ref}
					height={THUMBNAIL_HEIGHT}
					style={{
						maxHeight: THUMBNAIL_HEIGHT,
						width,
					}}
				/>
			</div>
		</div>
	);
};

export const VideoThumbnail = React.forwardRef(VideoThumbnailRefForward);
