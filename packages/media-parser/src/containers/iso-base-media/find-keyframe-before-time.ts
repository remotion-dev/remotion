import type {SamplePosition} from '../../get-sample-positions';
import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {MediaSection} from '../../state/video-section';
import {
	groupGetKeyframesFromGroupOfSamplePositions,
	type GroupOfSamplePositions,
} from './sample-positions';

export const findKeyframeBeforeTime = ({
	samplePositions,
	time,
	timescale,
	mediaSections,
	logLevel,
}: {
	samplePositions: GroupOfSamplePositions[];
	time: number;
	timescale: number;
	mediaSections: MediaSection[];
	logLevel: LogLevel;
}) => {
	let videoByte = 0;
	let videoSample: SamplePosition | null = null;

	for (const sample of groupGetKeyframesFromGroupOfSamplePositions(
		samplePositions,
	)) {
		const ctsInSeconds = sample.cts / timescale;
		const dtsInSeconds = sample.dts / timescale;

		if (!sample.isKeyframe) {
			continue;
		}

		if (!(ctsInSeconds <= time || dtsInSeconds <= time)) {
			continue;
		}

		if (videoByte <= sample.offset) {
			videoByte = sample.offset;
			videoSample = sample;
		}
	}

	if (!videoSample) {
		throw new Error('No sample found');
	}

	const mediaSection = mediaSections.find(
		(section) =>
			videoSample.offset >= section.start &&
			videoSample.offset < section.start + section.size,
	);

	if (!mediaSection) {
		Log.trace(
			logLevel,
			'Found a sample, but the offset has not yet been marked as a video section yet. Not yet able to seek, but probably once we have started reading the next box.',
			videoSample,
		);
		return null;
	}

	return videoSample.offset;
};
