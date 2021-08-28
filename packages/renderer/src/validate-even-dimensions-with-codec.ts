import {Codec} from 'remotion';

export const validateEvenDimensionsWithCodec = ({
	width,
	height,
	codec,
}: {
	width: number;
	height: number;
	codec: Codec;
}) => {
	if (codec !== 'h264-mkv' && codec !== 'h264') {
		return;
	}

	if (width % 2 !== 0) {
		throw new Error(
			`Codec error: You are trying to render a video with a H264 codec that has a width of ${width}px, which is an odd number. The H264 codec does only support dimensions with even numbers. Change the width to ${Math.floor(
				width - 1
			)}px to fix this issue.`
		);
	}

	if (height % 2 !== 0) {
		throw new Error(
			`Codec error: You are trying to render a video with a H264 codec that has a height of ${height}px, which is an odd number. The H264 codec does only support dimensions with even numbers. Change the height to ${Math.floor(
				height - 1
			)}px to fix this issue.`
		);
	}
};
