import {
	createAacCodecPrivate,
	getSampleRateFromSampleFrequencyIndex,
	mapAudioObjectTypeToCodecString,
} from '../../aac-codecprivate';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParseResult} from '../../parse-result';
import {registerAudioTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';

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
		await registerAudioTrack({
			state,
			container: 'aac',
			track: {
				codec: mapAudioObjectTypeToCodecString(audioObjectType),
				codecWithoutConfig: 'aac',
				codecPrivate,
				description: codecPrivate,
				numberOfChannels: channelConfiguration,
				sampleRate,
				timescale: 1_000_000,
				trackId: 0,
				trakBox: null,
				type: 'audio',
			},
		});
		state.callbacks.tracks.setIsDone(state.logLevel);
	}

	const duration = 1024 / sampleRate;
	const {index} = state.aac.addSample({offset: startOffset, size: frameLength});
	const timestamp = (1024 / sampleRate) * index;

	// One ADTS frame contains 1024 samples
	await state.callbacks.onAudioSample(
		0,
		convertAudioOrVideoSampleToWebCodecsTimestamps(
			{
				duration,
				type: 'key',
				data,
				offset: startOffset,
				timescale: 1_000_000,
				trackId: 0,
				cts: timestamp,
				dts: timestamp,
				timestamp,
			},
			1,
		),
	);

	return Promise.resolve(null);
};
