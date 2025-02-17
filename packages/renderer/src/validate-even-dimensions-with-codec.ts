import type {Codec} from './codec';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {truthy} from './truthy';

export const validateEvenDimensionsWithCodec = ({
	width,
	height,
	codec,
	scale,
	wantsImageSequence,
	indent,
	logLevel,
}: {
	width: number;
	height: number;
	scale: number;
	codec: Codec;
	wantsImageSequence: boolean;
	indent: boolean;
	logLevel: LogLevel;
}) => {
	if (wantsImageSequence) {
		return;
	}

	if (
		codec !== 'h264-mkv' &&
		codec !== 'h264' &&
		codec !== 'h265' &&
		codec !== 'h264-ts'
	) {
		return;
	}

	let actualWidth = width * scale;
	let actualHeight = height * scale;
	if (
		actualWidth % 1 !== 0 &&
		(actualWidth % 1 < 0.005 || actualWidth % 1 > 0.005)
	) {
		Log.verbose(
			{indent, logLevel},
			`Rounding width to an even number from ${actualWidth} to ${Math.round(actualWidth)}`,
		);
		actualWidth = Math.round(actualWidth);
	}

	if (
		actualHeight % 1 !== 0 &&
		(actualHeight % 1 < 0.005 || actualHeight % 1 > 0.005)
	) {
		Log.verbose(
			{indent, logLevel},
			`Rounding height to an even number from ${actualHeight} to ${Math.round(actualHeight)}`,
		);
		actualHeight = Math.round(actualHeight);
	}

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

	if (actualHeight % 2 !== 0) {
		const message = [
			`Codec error: You are trying to render a video with a ${displayName} codec that has a height of ${actualHeight}px, which is an uneven number.`,
			`The ${displayName} codec does only support dimensions that are evenly divisible by two. `,
			scale === 1
				? `Change the height to ${Math.floor(actualHeight - 1)}px to fix this issue.`
				: `You have used the "scale" option which might be the reason for the problem: The original height is ${height} and the scale is ${scale}x, which was multiplied to get the actual height.`,
		].join(' ');
		throw new Error(message);
	}
};
