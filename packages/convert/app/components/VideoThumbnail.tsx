import {useEffect, useRef} from 'react';

const THUMBNAIL_WIDTH = 350;
const THUMBNAIL_HEIGHT = Math.round((THUMBNAIL_WIDTH / 16) * 9);

export const VideoThumbnail: React.FC<{
	readonly thumbnail: VideoFrame | null;
}> = ({thumbnail}) => {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!thumbnail) {
			return;
		}

		createImageBitmap(thumbnail, {
			resizeWidth: THUMBNAIL_WIDTH,
			resizeHeight: THUMBNAIL_HEIGHT,
		}).then((bitmap) => {
			const twoDContext = ref.current?.getContext('2d');
			if (!twoDContext) {
				return;
			}

			twoDContext.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
			thumbnail.close();
		});
	}, [thumbnail]);

	return (
		<canvas
			ref={ref}
			width={THUMBNAIL_WIDTH}
			height={THUMBNAIL_HEIGHT}
			style={{
				maxHeight: THUMBNAIL_HEIGHT,
				width: THUMBNAIL_WIDTH,
				aspectRatio: '16 / 9',
			}}
		/>
	);
};
