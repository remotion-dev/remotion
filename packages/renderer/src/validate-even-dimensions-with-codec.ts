import type {Codec} from './codec';
import {truthy} from './truthy';

export const validateEvenDimensionsWithCodec = ({
	width,
	height,
	codec,
	scale,
}: {
	width: number;
	height: number;
	scale: number;
	codec: Codec;
}) => {
	if (codec !== 'h264-mkv' && codec !== 'h264' && codec !== 'h265') {
		return;
	}

	const actualWidth = width * scale;
	const actualHeight = height * scale;

	const displayName = codec === 'h265' ? 'H265' : 'H264';

	if (actualWidth % 2 !== 0) {
		const message = [
			`Codec error: You are trying to render a video with a ${displayName} codec that has a width of ${actualWidth}px, which is an uneven number.`,
			`The ${displayName} codec does only support dimensions that are evenly divisible by two.`,
			scale === 1
				? `Change the width to ${Math.floor(width - 1)}px to fix this issue.`
				: `You have used the "scale" option which might be the reason for the problem: The original width is ${width} and the scale is ${scale}x, which was multiplied to get the actual width.`,
		]
			.filter(truthy)
			.join(' ');
		throw new Error(message);
	}

	if (height % 2 !== 0) {
		const message = [
			`Codec error: You are trying to render a video with a ${displayName} codec that has a height of ${actualHeight}px, which is an uneven number.`,
			`The ${displayName} codec does only support dimensions that are evenly divisible by two. `,
			scale === 1
				? `Change the height to ${Math.floor(height - 1)}px to fix this issue.`
				: `You have used the "scale" option which might be the reason for the problem: The original height is ${height} and the scale is ${scale}x, which was multiplied to get the actual height.`,
		].join(' ');
		throw new Error(message);
	}
};
