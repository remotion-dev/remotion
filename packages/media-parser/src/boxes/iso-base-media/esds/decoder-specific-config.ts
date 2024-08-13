import type {BufferIterator} from '../../../buffer-iterator';

type UnknownDecoderSpecificConfig = {
	type: 'unknown-decoder-specific-config';
};

type AudioSpecificConfig = {
	type: 'audio-specific-config';
	audioObjectType: number;
	samplingFrequencyIndex: number;
	channelConfiguration: number;
};

export type DecoderSpecificConfig =
	| UnknownDecoderSpecificConfig
	| AudioSpecificConfig;

export const parseDecoderSpecificConfig = (
	iterator: BufferIterator,
): DecoderSpecificConfig => {
	const layerTag = iterator.getUint8();
	const layerSize = iterator.getPaddedFourByteNumber();

	const start = iterator.counter.getOffset();

	if (layerTag !== 5) {
		iterator.discard(layerSize);
		return {
			type: 'unknown-decoder-specific-config',
		};
	}

	iterator.startReadingBits();
	const audioObjectType = iterator.getBits(5);
	const samplingFrequencyIndex = iterator.getBits(4);
	const channelConfiguration = iterator.getBits(4);
	iterator.stopReadingBits();
	const read = iterator.counter.getOffset() - start;
	if (read < layerSize) {
		iterator.discard(layerSize - read);
	}

	return {
		type: 'audio-specific-config',
		audioObjectType,
		samplingFrequencyIndex,
		channelConfiguration,
	};
};
