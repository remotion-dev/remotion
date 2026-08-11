import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParserState} from '../../state/parser-state';
import type {QueuedVideoSample} from '../../state/riff/queued-frames';
import {getStrhForIndex} from './get-strh-for-index';

const getKeyFrameOffsetAndPocs = ({
	state,
	sample,
	trackId,
}: {
	state: ParserState;
	sample: QueuedVideoSample;
	trackId: number;
}) => {
	if (sample.type === 'key') {
		const sampleOffset = state.riff.sampleCounter.getSampleCountForTrack({
			trackId,
		});

		return {
			sampleOffsetAtKeyframe: sampleOffset,
			pocsAtKeyframeOffset: [sample.avc?.poc ?? 0],
		};
	}

	const riffKeyframes = state.riff.sampleCounter.riffKeys.getKeyframes();
	const keyframeAtOffset = riffKeyframes.findLast(
		(k) => k.positionInBytes <= sample.offset,
	);

	if (!keyframeAtOffset) {
		throw new Error('no keyframe at offset');
	}

	const sampleOffsetAtKeyframe = keyframeAtOffset.sampleCounts[trackId];
	const pocsAtKeyframeOffset = state.riff.sampleCounter.getPocAtKeyframeOffset({
		keyframeOffset: keyframeAtOffset.positionInBytes,
	});

	return {
		sampleOffsetAtKeyframe,
		pocsAtKeyframeOffset,
	};
};

export const convertQueuedSampleToMediaParserSample = ({
	sample,
	state,
	trackId,
}: {
	sample: QueuedVideoSample;
	state: ParserState;
	trackId: number;
}) => {
	const strh = getStrhForIndex(state.structure.getRiffStructure(), trackId);

	const samplesPerSecond = strh.rate / strh.scale;

	const {sampleOffsetAtKeyframe, pocsAtKeyframeOffset} =
		getKeyFrameOffsetAndPocs({
			sample,
			state,
			trackId,
		});
	const indexOfPoc = pocsAtKeyframeOffset.findIndex(
		(poc) => poc === sample.avc?.poc,
	);

	if (indexOfPoc === -1) {
		throw new Error('poc not found');
	}

	const nthSample = indexOfPoc + sampleOffsetAtKeyframe;
	const timestamp = nthSample / samplesPerSecond;
	const videoSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
		sample: {
			...sample,
			timestamp,
			decodingTimestamp: timestamp,
		},
		timescale: 1,
	});

	return videoSample;
};
