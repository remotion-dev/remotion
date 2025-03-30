import type {SamplePosition} from '../../get-sample-positions';
import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {MediaSection} from '../../state/video-section';

export const findKeyframeBeforeTime = ({
	samplePositions,
	time,
	timescale,
	mediaSections,
	logLevel,
}: {
	samplePositions: SamplePosition[];
	time: number;
	timescale: number;
	mediaSections: MediaSection[];
	logLevel: LogLevel;
}) => {
	let byte = 0;
	let sam: SamplePosition | null = null;

	for (const sample of samplePositions) {
		const ctsInSeconds = sample.cts / timescale;
		const dtsInSeconds = sample.dts / timescale;

		if (
			(ctsInSeconds <= time || dtsInSeconds <= time) &&
			byte <= sample.offset &&
			sample.isKeyframe
		) {
			byte = sample.offset;
			sam = sample;
		}
	}

	if (!sam) {
		throw new Error('No sample found');
	}

	const mediaSection = mediaSections.find(
		(section) =>
			sam.offset >= section.start && sam.offset < section.start + section.size,
	);

	if (!mediaSection) {
		Log.trace(
			logLevel,
			'Found a sample, but the offset has not yet been marked as a video section yet. Not yet able to seek, but probably once we have started reading the next box.',
			sam,
		);
		return null;
	}

	return sam.offset;
};
