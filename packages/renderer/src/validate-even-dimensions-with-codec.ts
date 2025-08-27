import type {Codec} from './codec';
import type {LogLevel} from './log-level';
import {Log} from './logger';

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
	let actualWidth = width * scale;
	let actualHeight = height * scale;
	if (wantsImageSequence) {
		return {
			actualWidth,
			actualHeight,
		};
	}

	if (
		codec !== 'h264-mkv' &&
		codec !== 'h264' &&
		codec !== 'h265' &&
		codec !== 'h264-ts'
	) {
		return {
			actualWidth,
			actualHeight,
		};
	}

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
		Log.verbose(
			{indent, logLevel},
			`Rounding width down to an even number from ${actualWidth} to ${actualWidth - 1} for ${displayName} codec compatibility`,
		);
		actualWidth -= 1;
	}

	if (actualHeight % 2 !== 0) {
		Log.verbose(
			{indent, logLevel},
			`Rounding height down to an even number from ${actualHeight} to ${actualHeight - 1} for ${displayName} codec compatibility`,
		);
		actualHeight -= 1;
	}

	return {
		actualWidth,
		actualHeight,
	};
};
