import {combineUint8Arrays} from '../../../../boxes/webm/make-header';
import {
	addSize,
	numberTo16BitUIntOrInt,
	setFixedPointSignedOrUnsigned1616Number,
	stringsToUint8Array,
	stringToPascalString,
} from '../../primitives';

export const createAvc1 = ({
	avccBox,
	pasp,
	btrt,
	width,
	height,
	horizontalResolution,
	verticalResolution,
	compressorName,
	depth,
}: {
	pasp: Uint8Array;
	avccBox: Uint8Array;
	btrt: Uint8Array;
	width: number;
	height: number;
	horizontalResolution: number;
	verticalResolution: number;
	compressorName: string;
	depth: number;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('avc1'),
			// reserved
			new Uint8Array([0, 0, 0, 0, 0, 0]),
			// data_reference_index
			new Uint8Array([0, 1]),
			// version
			new Uint8Array([0, 0]),
			// revisionLevel
			new Uint8Array([0, 0]),
			// vendor
			new Uint8Array([0, 0, 0, 0]),
			// temporalQuality
			new Uint8Array([0, 0, 0, 0]),
			// spatialQuality
			new Uint8Array([0, 0, 0, 0]),
			// width
			numberTo16BitUIntOrInt(width),
			// height
			numberTo16BitUIntOrInt(height),
			// horizontalResolution
			setFixedPointSignedOrUnsigned1616Number(horizontalResolution),
			// verticalResolution
			setFixedPointSignedOrUnsigned1616Number(verticalResolution),
			// dataSize
			new Uint8Array([0, 0, 0, 0]),
			// frame count per sample
			numberTo16BitUIntOrInt(1),
			// compressor name
			stringToPascalString(compressorName),
			// depth
			numberTo16BitUIntOrInt(depth),
			// colorTableId
			numberTo16BitUIntOrInt(-1),
			// avcc box
			avccBox,
			// pasp
			pasp,
			// btrt
			btrt,
		]),
	);
};
