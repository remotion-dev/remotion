import type {SamplePosition} from '../../get-sample-positions';
import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {MediaSection} from '../../state/video-section';

export const findKeyframeBeforeTime = ({
	samplePositions,
	time,
	timescale,
	mediaSections,
	logLevel,
	startInSeconds,
}: {
	samplePositions: SamplePosition[];
	time: number;
	timescale: number;
	mediaSections: MediaSection[];
	logLevel: MediaParserLogLevel;
	startInSeconds: number;
}) => {
	let videoByte = 0;
	let videoSample: SamplePosition | null = null;

	for (const sample of samplePositions) {
		const ctsInSeconds = sample.timestamp / timescale + startInSeconds;
		const dtsInSeconds = sample.decodingTimestamp / timescale + startInSeconds;

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

	return videoSample;
};
