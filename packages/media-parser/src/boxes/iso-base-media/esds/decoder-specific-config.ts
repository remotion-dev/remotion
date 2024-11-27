import type {BufferIterator} from '../../../buffer-iterator';
import type {LogLevel} from '../../../log';
import {Log} from '../../../log';

type UnknownDecoderSpecificConfig = {
	type: 'unknown-decoder-specific-config';
};

type AudioSpecificConfig = {
	type: 'mp4a-specific-config';
	audioObjectType: number;
	samplingFrequencyIndex: number;
	channelConfiguration: number;
	asBytes: Uint8Array;
};

export type DecoderSpecificConfig =
	| UnknownDecoderSpecificConfig
	| AudioSpecificConfig;

export const parseDecoderSpecificConfig = (
	iterator: BufferIterator,
	logLevel: LogLevel,
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

	// https://csclub.uwaterloo.ca/~pbarfuss/ISO14496-3-2009.pdf
	// 1.6.2.1 AudioSpecificConfig

	const bytes = iterator.getSlice(layerSize);
	iterator.counter.decrement(layerSize);

	iterator.startReadingBits();
	const audioObjectType = iterator.getBits(5);
	const samplingFrequencyIndex = iterator.getBits(4);
	if (samplingFrequencyIndex === 0xf) {
		iterator.getBits(24);
	}

	const channelConfiguration = iterator.getBits(4);
	iterator.stopReadingBits();
	const read = iterator.counter.getOffset() - start;
	if (read < layerSize) {
		iterator.discard(layerSize - read);
	}

	let patchedBytes = bytes;

	if (bytes[0] === 18 && bytes[1] === 16) {
		// riverside_use_cursor_.mp4
		patchedBytes = new Uint8Array([18, 8]);
		Log.warn(
			logLevel,
			'Chrome has a bug and might not be able to decode this audio. It will be fixed, see: https://issues.chromium.org/issues/360083330',
		);
	}

	if (bytes.byteLength === 2 && bytes[0] === 17 && bytes[1] === 136) {
		patchedBytes = new Uint8Array([18, 144]);
		Log.warn(
			logLevel,
			'Chrome has a bug and might not be able to decode this audio. It will be fixed, see: https://issues.chromium.org/issues/360083330',
		);
	}

	return {
		type: 'mp4a-specific-config',
		audioObjectType,
		samplingFrequencyIndex,
		channelConfiguration,
		asBytes: patchedBytes,
	};
};
