import {combineUint8Arrays} from '../../matroska/matroska-utils';
import {
	addSize,
	numberTo16BitUIntOrInt,
	setFixedPointSignedOrUnsigned1616Number,
	stringsToUint8Array,
	stringToPascalString,
} from '../primitives';
import type {Hvc1Data} from './create-codec-specific-data';

export const createHvc1Data = ({
	compressorName,
	depth,
	height,
	horizontalResolution,
	hvccBox,
	pasp,
	verticalResolution,
	width,
}: Hvc1Data) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('hvc1'),
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
			// hvcc box
			hvccBox,
			// pasp
			pasp,
		]),
	);
};
