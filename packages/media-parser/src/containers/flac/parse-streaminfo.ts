import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {registerAudioTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
import type {FlacStreamInfo} from './types';

export const parseStreamInfo = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const counter = iterator.counter.getOffset();
	const minimumBlockSize = iterator.getUint16();
	const maximumBlockSize = iterator.getUint16();
	const minimumFrameSize = iterator.getUint24();
	const maximumFrameSize = iterator.getUint24();
	iterator.startReadingBits();
	const sampleRate = iterator.getBits(20);
	const channels = iterator.getBits(3) + 1;
	const bitsPerSample = iterator.getBits(5);
	const totalSamples = iterator.getBits(36);
	iterator.getBits(128); // md5
	iterator.stopReadingBits();
	const counterNow = iterator.counter.getOffset();
	const size = counterNow - counter;
	iterator.counter.decrement(size);
	const asUint8Array = iterator.getSlice(size);

	const flacStreamInfo: FlacStreamInfo = {
		type: 'flac-streaminfo',
		bitsPerSample,
		channels,
		maximumBlockSize,
		maximumFrameSize,
		minimumBlockSize,
		minimumFrameSize,
		sampleRate,
		totalSamples,
	};

	state.structure.getFlacStructure().boxes.push(flacStreamInfo);

	await registerAudioTrack({
		container: 'flac',
		track: {
			codec: 'flac',
			type: 'audio',
			description: asUint8Array,
			codecData: {type: 'flac-description', data: asUint8Array},
			codecEnum: 'flac',
			numberOfChannels: channels,
			sampleRate,
			originalTimescale: WEBCODECS_TIMESCALE,
			trackId: 0,
			startInSeconds: 0,
			timescale: WEBCODECS_TIMESCALE,
			trackMediaTimeOffsetInTrackTimescale: 0,
		},
		registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
		tracks: state.callbacks.tracks,
		logLevel: state.logLevel,
		onAudioTrack: state.onAudioTrack,
	});

	state.callbacks.tracks.setIsDone(state.logLevel);

	return Promise.resolve(null);
};
