import {
	createAacCodecPrivate,
	getSampleRateFromSampleFrequencyIndex,
} from '../../aac-codecprivate';
import {getArrayBufferIterator} from '../../buffer-iterator';

export const readAdtsHeader = (buffer: Uint8Array) => {
	if (buffer.byteLength < 9) {
		return null;
	}

	const iterator = getArrayBufferIterator(buffer, buffer.byteLength);

	iterator.startReadingBits();
	const bits = iterator.getBits(12);
	if (bits !== 0xfff) {
		throw new Error('Invalid ADTS header ');
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
	iterator.destroy();

	return {
		frameLength,
		codecPrivate,
		channelConfiguration,
		sampleRate,
		audioObjectType,
	};
};
