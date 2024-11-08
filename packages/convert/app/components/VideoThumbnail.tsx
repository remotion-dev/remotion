import {FastAverageColor} from 'fast-average-color';
import {useEffect, useRef, useState} from 'react';

const THUMBNAIL_HEIGHT = Math.round((350 / 16) * 9);

export const VideoThumbnail: React.FC<{
	readonly thumbnail: VideoFrame | null;
}> = ({thumbnail}) => {
	const ref = useRef<HTMLCanvasElement>(null);

	const scaleRatio = thumbnail ? THUMBNAIL_HEIGHT / thumbnail.displayHeight : 0;
	const width = thumbnail ? Math.round(thumbnail.displayWidth * scaleRatio) : 0;

	const [color, setColor] = useState<string>('transparent');

	useEffect(() => {
		if (!thumbnail) {
			return;
		}

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
		<div
			className="border-b-2 border-black flex justify-center"
			style={{height: THUMBNAIL_HEIGHT, background: color}}
		>
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
