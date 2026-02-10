export type FrameRange = number | [number, number] | [number, null];

export const getRealFrameRange = (
	durationInFrames: number,
	frameRange: FrameRange | null,
): [number, number] => {
	if (frameRange === null) {
		return [0, durationInFrames - 1];
	}

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

	const resolved: [number, number] = [
		frameRange[0],
		frameRange[1] === null ? durationInFrames - 1 : frameRange[1],
	];

	if (resolved[1] >= durationInFrames || resolved[0] < 0) {
		throw new Error(
			`The "durationInFrames" of the composition was evaluated to be ${durationInFrames}, but frame range ${resolved.join('-')} is not inbetween 0-${
				durationInFrames - 1
			}`,
		);
	}

	return resolved;
};
