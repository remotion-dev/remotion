import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParserState} from '../../state/parser-state';
import type {QueuedVideoSample} from '../../state/riff/queued-frames';
import {getStrhForIndex} from './get-strh-for-index';

export const convertQueuedSampleToMediaParserSample = (
	sample: QueuedVideoSample,
	state: ParserState,
) => {
	const strh = getStrhForIndex(
		state.structure.getRiffStructure(),
		sample.trackId,
	);

	const samplesPerSecond = strh.rate / strh.scale;

	const nthSample = state.riff.sampleCounter.getSamplesForTrack(sample.trackId);
	const timeInSec = nthSample / samplesPerSecond;
	const timestamp = timeInSec;
	const videoSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
		sample: {
			...sample,
			timestamp,
			cts: timestamp,
			dts: timestamp,
		},
		timescale: 1,
	});

	return videoSample;
};
