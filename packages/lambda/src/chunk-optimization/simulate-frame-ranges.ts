import {ChunkTimingData} from './types';

export const getTimingForFrame = (
	profile: ChunkTimingData[],
	frame: number
) => {
	for (const timingInfo of profile) {
		let lastTime = timingInfo.startDate;
		for (const [fr, timing] of Object.entries(timingInfo.timings)) {
			const actualFrame = timingInfo.frameRange[0] + Number(fr) - 1;
			const absolute = timing + timingInfo.startDate;
			if (actualFrame === frame) {
				return absolute - lastTime;
			}

			lastTime = absolute;
		}
	}

	throw new Error(`Frame ${frame} was not rendered`);
};

export const getSimulatedTimingForFrameRange = (
	profile: ChunkTimingData[],
	frameRange: [number, number]
): ChunkTimingData['timings'] => {
	const timings: ChunkTimingData['timings'] = {};

	let totalDuration = 0;
	let index = 1;
	for (let i = frameRange[0]; i < frameRange[1]; i++) {
		timings[index] = getTimingForFrame(profile, i) + totalDuration;
		totalDuration += getTimingForFrame(profile, i);
		index++;
	}

	return timings;
};

export const simulateFrameRanges = ({
	profile,
	newFrameRanges,
}: {
	profile: ChunkTimingData[];
	newFrameRanges: [number, number][];
}): ChunkTimingData[] => {
	if (profile.length !== newFrameRanges.length) {
		throw new Error('Expected previous and new frame ranges to be equal');
	}

	return newFrameRanges.map((range, i) => {
		return {
			timings: getSimulatedTimingForFrameRange(profile, range),
			chunk: i,
			frameRange: range,
			startDate: profile[i].startDate,
		};
	});
};
