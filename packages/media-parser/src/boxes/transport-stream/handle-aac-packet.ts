import {
	createAacCodecPrivate,
	getSampleRateFromSampleFrequencyIndex,
	mapAudioObjectTypeToCodecString,
} from '../../aac-codecprivate';
import {getArrayBufferIterator} from '../../buffer-iterator';
import type {Track} from '../../get-tracks';
import type {ParserContext} from '../../parser-context';
import {registerTrack} from '../../register-track';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';

export const handleAacPacket = async ({
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
	iterator.getBits(1); // private bit
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
	iterator.getBits(13); // frame length
	iterator.getBits(11); // buffer fullness
	iterator.getBits(2); // number of AAC frames minus 1

	if (!protectionAbsent) {
		iterator.getBits(16); // crc
	}

	iterator.stopReadingBits();
	iterator.destroy();

	const isTrackRegistered = options.parserState.tracks.getTracks().find((t) => {
		return t.trackId === programId;
	});

	if (!isTrackRegistered) {
		const track: Track = {
			type: 'audio',
			codecPrivate,
			trackId: programId,
			trakBox: null,
			timescale: sampleRate,
			codecWithoutConfig: 'aac',
			codec: mapAudioObjectTypeToCodecString(audioObjectType),
			// https://www.w3.org/TR/webcodecs-aac-codec-registration/
			description: undefined,
			numberOfChannels: channelConfiguration,
			sampleRate,
		};
		await registerTrack({track, options});
	}

	const sample: AudioOrVideoSample = {
		cts: streamBuffer.pesHeader.pts,
		dts: streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts,
		timestamp: streamBuffer.pesHeader.pts,
		duration: undefined,
		data: new Uint8Array(streamBuffer.buffer),
		trackId: programId,
		type: 'key',
	};

	await options.parserState.onAudioSample(programId, sample);
};
