import {combineUint8Arrays} from '../../boxes/webm/make-header';
import {
	addSize,
	floatTo16Point1632Bit,
	floatTo16Point16_16Bit,
	numberTo32BitUIntOrInt,
	setFixedPointSigned1616Number,
	setFixedPointSigned230Number,
	stringsToUint8Array,
} from './primitives';

const serializeMatrix = (matrix: number[]) => {
	const result: Uint8Array[] = [];
	for (let i = 0; i < matrix.length; i++) {
		if (i % 3 === 2) {
			result.push(setFixedPointSigned230Number(matrix[i]));
		} else {
			result.push(setFixedPointSigned1616Number(matrix[i]));
		}
	}

	return combineUint8Arrays(result);
};

export const createMvhd = ({
	timescale,
	durationInUnits,
	rate,
	volume,
	nextTrackId,
	matrix,
}: {
	timescale: number;
	durationInUnits: number;
	rate: number;
	volume: number;
	nextTrackId: number;
	matrix: number[];
}) => {
	if (matrix.length !== 9) {
		throw new Error('Matrix must be 9 elements long');
	}

	const content = combineUint8Arrays([
		// type
		stringsToUint8Array('mvhd'),
		// version
		new Uint8Array([0]),
		// flags
		new Uint8Array([0, 0, 0]),
		// creation time, 32bit for version 0
		numberTo32BitUIntOrInt(0),
		// modification time, 32bit for version 0
		numberTo32BitUIntOrInt(0),
		// timescale
		numberTo32BitUIntOrInt(timescale),
		// duration in units, 32bit for version 0
		numberTo32BitUIntOrInt(durationInUnits),
		// rate
		floatTo16Point1632Bit(rate),
		// volume
		floatTo16Point16_16Bit(volume),
		// reserved
		new Uint8Array([0, 0]),
		// reserved
		new Uint8Array([0, 0, 0, 0]),
		// reserved
		new Uint8Array([0, 0, 0, 0]),
		serializeMatrix(matrix),
		// predefined
		combineUint8Arrays(new Array(6).fill(new Uint8Array([0, 0, 0, 0]))),
		// next track id
		numberTo32BitUIntOrInt(nextTrackId),
	]);

	return addSize(content);
};
