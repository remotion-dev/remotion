import {
	createAacCodecPrivate,
	getSampleRateFromSampleFrequencyIndex,
	mapAudioObjectTypeToCodecString,
} from '../../aac-codecprivate';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParseResult} from '../../parse-result';
import {registerAudioTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

export const parseAac = async (state: ParserState): Promise<ParseResult> => {
	const {iterator} = state;
	const startOffset = iterator.counter.getOffset();

	iterator.startReadingBits();
	const syncWord = iterator.getBits(12);
	if (syncWord !== 0xfff) {
		throw new Error('Invalid syncword: ' + syncWord);
	}

	const id = iterator.getBits(1);
	if (id !== 0) {
		throw new Error('Only supporting MPEG-4 for .aac');
	}

	const layer = iterator.getBits(2);
	if (layer !== 0) {
		throw new Error('Only supporting layer 0 for .aac');
	}

	const protectionAbsent = iterator.getBits(1); // protection absent
	const audioObjectType = iterator.getBits(2); // 1 = 'AAC-LC'

	const samplingFrequencyIndex = iterator.getBits(4);
	const sampleRate = getSampleRateFromSampleFrequencyIndex(
		samplingFrequencyIndex,
	);
	iterator.getBits(1); // private bit
	const channelConfiguration = iterator.getBits(3);
	const codecPrivate = createAacCodecPrivate({
		audioObjectType,
		sampleRate,
		channelConfiguration,
		codecPrivate: null,
	});
	iterator.getBits(1); // originality
	iterator.getBits(1); // home
	iterator.getBits(1); // copyright bit
	iterator.getBits(1); // copy start
	const frameLength = iterator.getBits(13); // frame length
	iterator.getBits(11); // buffer fullness
	iterator.getBits(2); // number of AAC frames minus 1
	if (!protectionAbsent) {
		iterator.getBits(16); // crc
	}

	iterator.stopReadingBits();
	iterator.counter.decrement(iterator.counter.getOffset() - startOffset);
	const data = iterator.getSlice(frameLength);

	if (state.callbacks.tracks.getTracks().length === 0) {
		state.mediaSection.addMediaSection({
			start: startOffset,
			size: state.contentLength - startOffset,
		});
		await registerAudioTrack({
			container: 'aac',
			track: {
				codec: mapAudioObjectTypeToCodecString(audioObjectType),
				codecEnum: 'aac',
				codecData: {type: 'aac-config', data: codecPrivate},
				description: codecPrivate,
				numberOfChannels: channelConfiguration,
				sampleRate,
				originalTimescale: WEBCODECS_TIMESCALE,
				trackId: 0,
				type: 'audio',
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
	}

	const duration = 1024 / sampleRate;
	const {index} = state.aac.addSample({offset: startOffset, size: frameLength});
	const timestamp = (1024 / sampleRate) * index;

	state.aac.audioSamples.addSample({
		timeInSeconds: timestamp,
		offset: startOffset,
		durationInSeconds: duration,
	});

	// One ADTS frame contains 1024 samples
	const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
		sample: {
			duration,
			type: 'key',
			data,
			offset: startOffset,
			decodingTimestamp: timestamp,
			timestamp,
		},
		timescale: 1,
	});

	await state.callbacks.onAudioSample({
		audioSample,
		trackId: 0,
	});

	return Promise.resolve(null);
};
