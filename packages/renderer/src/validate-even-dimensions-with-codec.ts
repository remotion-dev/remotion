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
	if (codec !== 'h264-mkv' && codec !== 'h264' && codec !== 'h265') {
		return;
	}

	const displayName = codec === 'h265' ? 'H265' : 'H264';

	if (width % 2 !== 0) {
		throw new Error(
			`Codec error: You are trying to render a video with a ${displayName} codec that has a width of ${width}px, which is an odd number. The ${displayName} codec does only support dimensions with even numbers. Change the width to ${Math.floor(
				width - 1
			)}px to fix this issue.`
		);
	}

	if (height % 2 !== 0) {
		throw new Error(
			`Codec error: You are trying to render a video with a ${displayName} codec that has a height of ${height}px, which is an odd number. The ${displayName} codec does only support dimensions with even numbers. Change the height to ${Math.floor(
				height - 1
			)}px to fix this issue.`
		);
	}
};
