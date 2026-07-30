import {
	isMultipleFrameRanges,
	type FrameRange,
	type FrameRangeTuple,
	type ResolvedFrameRange,
	validateFrameRange,
} from './frame-range';

const resolveFrameRange = (
	durationInFrames: number,
	frameRange: number | FrameRangeTuple,
): ResolvedFrameRange => {
	if (typeof frameRange === 'number') {
		if (frameRange < 0 || frameRange >= durationInFrames) {
			throw new Error(
				`Frame number is out of range, must be between 0 and ${
					durationInFrames - 1
				} but got ${frameRange}`,
			);
		}

		return [frameRange, frameRange];
	}

	const resolved: ResolvedFrameRange = [
		frameRange[0],
		frameRange[1] === null ? durationInFrames - 1 : frameRange[1],
	];

	if (
		resolved[0] < 0 ||
		resolved[1] >= durationInFrames ||
		resolved[0] > resolved[1]
	) {
		throw new Error(
			`The "durationInFrames" of the <Composition /> was evaluated to be ${durationInFrames}, but frame range ${resolved.join('-')} is not inbetween 0-${
				durationInFrames - 1
			}`,
		);
	}

	return resolved;
};

export const getRealFrameRanges = (
	durationInFrames: number,
	frameRange: FrameRange | null,
): ResolvedFrameRange[] => {
	if (frameRange === null) {
		return [[0, durationInFrames - 1]];
	}

	validateFrameRange(frameRange);

	if (isMultipleFrameRanges(frameRange)) {
		return frameRange.map((range) =>
			resolveFrameRange(durationInFrames, range),
		);
	}

	return [resolveFrameRange(durationInFrames, frameRange)];
};

export const getRealFrameRange = (
	durationInFrames: number,
	frameRange: FrameRange | null,
): [number, number] => {
	const ranges = getRealFrameRanges(durationInFrames, frameRange);
	if (ranges.length !== 1) {
		throw new Error(
			'Expected a single frame range, but received multiple frame ranges.',
		);
	}

	return ranges[0];
};
