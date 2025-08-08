import type {BufferIterator} from '../../../iterator/buffer-iterator';

export interface VpccBox {
	type: 'vpcc-box';
	profile: number;
	level: number;
	bitDepth: number;
	chromaSubsampling: number;
	videoFullRangeFlag: number;
	videoColorPrimaries: number;
	videoTransferCharacteristics: number;
	videoMatrixCoefficients: number;
	codecInitializationDataSize: number;
	codecInitializationData: Uint8Array;
	codecString: string;
}

const getvp09ConfigurationString = ({
	profile,
	level,
	bitDepth,
}: {
	profile: number;
	level: number;
	bitDepth: number;
}) => {
	return `${String(profile).padStart(2, '0')}.${String(level).padStart(2, '0')}.${String(bitDepth).padStart(2, '0')}`;
};

export const parseVpcc = ({
	data,
	size,
}: {
	data: BufferIterator;
	size: number;
}): VpccBox => {
	const box = data.startBox(size - 8);

	const confVersion = data.getUint8();
	if (confVersion !== 1) {
		throw new Error(`Unsupported AVCC version ${confVersion}`);
	}

	data.discard(3); // flags

	const profile = data.getUint8();
	const level = data.getUint8();
	data.startReadingBits();
	const bitDepth = data.getBits(4);
	const chromaSubsampling = data.getBits(3);
	const videoFullRangeFlag = data.getBits(1);
	const videoColorPrimaries = data.getBits(8);
	const videoTransferCharacteristics = data.getBits(8);
	const videoMatrixCoefficients = data.getBits(8);
	data.stopReadingBits();

	const codecInitializationDataSize = data.getUint16();
	const codecInitializationData = data.getSlice(codecInitializationDataSize);

	box.expectNoMoreBytes();

	return {
		type: 'vpcc-box',
		profile,
		level,
		bitDepth,
		chromaSubsampling,
		videoFullRangeFlag,
		videoColorPrimaries,
		videoTransferCharacteristics,
		videoMatrixCoefficients,
		codecInitializationDataSize,
		codecInitializationData,
		codecString: getvp09ConfigurationString({profile, level, bitDepth}),
	};
};
