import {
	createAacCodecPrivate,
	getSampleRateFromSampleFrequencyIndex,
	mapAudioObjectTypeToCodecString,
} from '../../aac-codecprivate';
import {getArrayBufferIterator} from '../../buffer-iterator';
import type {Track} from '../../get-tracks';
import type {ParserContext} from '../../parser-context';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';

export const handleAacPacket = ({
	streamBuffer,
	options,
	programId,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	options: ParserContext;
	programId: number;
}) => {
	const iterator = getArrayBufferIterator(
		streamBuffer.buffer,
		streamBuffer.buffer.byteLength,
	);

	iterator.startReadingBits();
	const bits = iterator.getBits(12);
	if (bits !== 0xfff) {
		throw new Error('Invalid ADTS header');
	}

	// MPEG Version, set to 0 for MPEG-4 and 1 for MPEG-2.
	const id = iterator.getBits(1);
	if (id !== 0) {
		throw new Error('Only supporting MPEG-4 for .ts');
	}

	const layer = iterator.getBits(2);
	if (layer !== 0) {
		throw new Error('Only supporting layer 0 for .ts');
	}

	const protectionAbsent = iterator.getBits(1); // protection absent
	const audioObjectType = iterator.getBits(2); // 1 = 'AAC-LC'

	const samplingFrequencyIndex = iterator.getBits(4);
	const sampleRate = getSampleRateFromSampleFrequencyIndex(
		samplingFrequencyIndex,
	);
	const privateBit = iterator.getBits(1);
	const channelConfiguration = iterator.getBits(3);
	const codecPrivate = createAacCodecPrivate({
		audioObjectType,
		sampleRate,
		channelConfiguration,
	});
	iterator.getBits(1); // originality
	iterator.getBits(1); // home
	iterator.getBits(1); // copyright bit
	iterator.getBits(1); // copy start
	const frameLength = iterator.getBits(13);
	const adtsBufferFullness = iterator.getBits(11);
	const numberOfAacFrames = iterator.getBits(2) + 1;

	if (!protectionAbsent) {
		iterator.getBits(16); // crc
	}

	iterator.stopReadingBits();
	iterator.destroy();

	const isTrackRegistered = options.parserState.tracks.getTracks().find((t) => {
		return t.trackId === programId;
	});

	const track: Track = {
		type: 'audio',
		codecPrivate,
		trackId: programId,
		trakBox: null,
		timescale: sampleRate,
		codecWithoutConfig: 'aac',
		codec: mapAudioObjectTypeToCodecString(audioObjectType),
		description: codecPrivate,
		numberOfChannels: channelConfiguration,
		sampleRate,
	};

	console.log({
		audioObjectType,
		samplingFrequencyIndex,
		sampleRate,
		privateBit,
		channelConfiguration,
		codecPrivate,
		frameLength,
		adtsBufferFullness,
		numberOfAacFrames,
		length: streamBuffer.buffer.byteLength,
		isTrackRegistered,
		track,
	});
};
