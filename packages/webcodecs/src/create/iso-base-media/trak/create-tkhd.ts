import {fromUnixTimestamp} from '../../../from-unix-timestamp';
import {combineUint8Arrays} from '../../matroska/matroska-utils';
import {
	addSize,
	floatTo16Point16_16Bit,
	IDENTITY_MATRIX,
	numberTo32BitUIntOrInt,
	serializeMatrix,
	setFixedPointSignedOrUnsigned1616Number,
	stringsToUint8Array,
} from '../primitives';

export const TKHD_FLAGS = {
	TRACK_ENABLED: 0x000001,
	TRACK_IN_MOVIE: 0x000002,
	TRACK_IN_PREVIEW: 0x000004,
	TRACK_IN_POSTER: 0x000008,
};

export const createTkhdForAudio = ({
	creationTime,
	modificationTime,
	flags,
	trackId,
	duration,
	volume,
	timescale,
}: {
	creationTime: number | null;
	modificationTime: number | null;
	flags: number;
	trackId: number;
	duration: number;
	volume: number;
	timescale: number;
}) => {
	return addSize(
		combineUint8Arrays([
			// name
			stringsToUint8Array('tkhd'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, flags]),
			// creation time
			creationTime === null
				? numberTo32BitUIntOrInt(0)
				: numberTo32BitUIntOrInt(fromUnixTimestamp(creationTime)),
			// modification time
			modificationTime === null
				? numberTo32BitUIntOrInt(0)
				: numberTo32BitUIntOrInt(fromUnixTimestamp(modificationTime)),
			// trackId
			numberTo32BitUIntOrInt(trackId),
			// reserved
			new Uint8Array([0, 0, 0, 0]),
			// duration
			numberTo32BitUIntOrInt(Math.round((duration / 1000) * timescale)),
			// reserved
			new Uint8Array([0, 0, 0, 0]),
			new Uint8Array([0, 0, 0, 0]),
			// layer
			new Uint8Array([0, 0]),
			// alternate group, 1 = 'sound'
			new Uint8Array([0, 1]),
			// volume
			floatTo16Point16_16Bit(volume),
			// reserved
			new Uint8Array([0, 0]),
			// matrix
			serializeMatrix(IDENTITY_MATRIX),
			// width
			setFixedPointSignedOrUnsigned1616Number(0),
			// height
			setFixedPointSignedOrUnsigned1616Number(0),
		]),
	);
};

export const createTkhdForVideo = ({
	creationTime,
	modificationTime,
	duration,
	trackId,
	volume,
	matrix,
	width,
	height,
	flags,
	timescale,
}: {
	creationTime: number | null;
	modificationTime: number | null;
	trackId: number;
	duration: number;
	volume: number;
	matrix: number[];
	width: number;
	height: number;
	flags: number;
	timescale: number;
}) => {
	const content = combineUint8Arrays([
		// name
		stringsToUint8Array('tkhd'),
		// version
		new Uint8Array([0]),
		// flags
		new Uint8Array([0, 0, flags]),
		// creation time
		creationTime === null
			? numberTo32BitUIntOrInt(0)
			: numberTo32BitUIntOrInt(fromUnixTimestamp(creationTime)),
		// modification time
		modificationTime === null
			? numberTo32BitUIntOrInt(0)
			: numberTo32BitUIntOrInt(fromUnixTimestamp(modificationTime)),
		// trackId
		numberTo32BitUIntOrInt(trackId),
		// reserved
		new Uint8Array([0, 0, 0, 0]),
		// duration
		numberTo32BitUIntOrInt((duration / 1000) * timescale),
		// reserved
		new Uint8Array([0, 0, 0, 0]),
		new Uint8Array([0, 0, 0, 0]),
		// layer
		new Uint8Array([0, 0]),
		// alternate group, 0 = 'video'
		new Uint8Array([0, 0]),
		// volume
		floatTo16Point16_16Bit(volume),
		// reserved
		new Uint8Array([0, 0]),
		// matrix
		serializeMatrix(matrix),
		// width
		setFixedPointSignedOrUnsigned1616Number(width),
		// height
		setFixedPointSignedOrUnsigned1616Number(height),
	]);

	return addSize(content);
};
