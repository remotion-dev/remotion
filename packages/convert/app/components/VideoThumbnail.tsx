import {FastAverageColor} from 'fast-average-color';
import React, {useEffect, useRef, useState} from 'react';

const THUMBNAIL_HEIGHT = Math.round((350 / 16) * 9);

const ThumbnailContent: React.FC<{readonly thumbnail: VideoFrame}> = ({
	thumbnail,
}) => {
	const ref = useRef<HTMLCanvasElement>(null);

	const scaleRatio = THUMBNAIL_HEIGHT / thumbnail.displayHeight;
	const width = Math.round(thumbnail.displayWidth * scaleRatio);

	const [color, setColor] = useState<string>('transparent');

	useEffect(() => {
		createImageBitmap(thumbnail, {
			resizeWidth: width,
			resizeHeight: THUMBNAIL_HEIGHT,
		}).then((bitmap) => {
			const twoDContext = ref.current?.getContext('2d');
			if (!twoDContext) {
				return;
			}

			twoDContext.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
			const color = new FastAverageColor().getColor(ref.current);
			setColor(color.hex);
		});
	}, [scaleRatio, thumbnail, width]);

	return (
		<div className="flex justify-center" style={{backgroundColor: color}}>
			<canvas
				ref={ref}
				width={width}
				height={THUMBNAIL_HEIGHT}
				style={{
					maxHeight: THUMBNAIL_HEIGHT,
					width,
				}}
			/>
		</div>
	);
};
export const VideoThumbnail: React.FC<{
	readonly thumbnail: VideoFrame | null;
}> = ({thumbnail}) => {
	return (
		<div
			className="border-b-2 border-black "
			style={{height: THUMBNAIL_HEIGHT}}
		>
			{thumbnail ? <ThumbnailContent thumbnail={thumbnail} /> : null}
		</div>
	);
};
