import {VideoMetadata} from '@remotion/media-utils';
import {useVideoConfig, Video} from 'remotion';

export type Size = {
	width: number;
	height: number;
	left: number;
	top: number;
};

export const calculateScale = ({
	previewSize,
	compositionWidth,
	compositionHeight,
	canvasSize,
}: {
	previewSize: 'auto';
	compositionWidth: number;
	compositionHeight: number;
	canvasSize: Size;
}) => {
	const heightRatio = canvasSize.height / compositionHeight;
	const widthRatio = canvasSize.width / compositionWidth;

	const ratio = Math.min(heightRatio, widthRatio);

	const scale = previewSize === 'auto' ? ratio : Number(previewSize);
	const correction = 0 - (1 - scale) / 2;
	const xCorrection = correction * compositionWidth;
	const yCorrection = correction * compositionHeight;
	const width = compositionWidth * scale;
	const height = compositionHeight * scale;
	const centerX = canvasSize.width / 2 - width / 2;
	const centerY = canvasSize.height / 2 - height / 2;
	return {
		centerX,
		centerY,
		xCorrection,
		yCorrection,
		scale,
	};
};

const margin = 100;

export const ShowcaseVideo: React.FC<{
	muxId: string;
	videoMetadata: VideoMetadata | null;
}> = ({muxId, videoMetadata}) => {
	const {width, height} = useVideoConfig();

	if (!videoMetadata) {
		return null;
	}

	const data = calculateScale({
		previewSize: 'auto',
		canvasSize: {
			height: height - margin,
			width: width - margin,
			left: 0,
			top: 0,
		},
		compositionHeight: videoMetadata.height,
		compositionWidth: videoMetadata.width,
	});

	return (
		<div
			style={{
				backgroundColor: 'white',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<Video
				style={{
					width: videoMetadata.width * data.scale,
					height: videoMetadata.height * data.scale,
					boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
				}}
				src={`https://stream.mux.com/${muxId}/high.mp4`}
			/>
		</div>
	);
};
