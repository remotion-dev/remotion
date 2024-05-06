type ThreeDMatrix = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
];

export type MvhdBox = {
	durationInUnits: number;
	durationInSeconds: number;
	creationTime: number | null;
	modificationTime: number | null;
	timeScale: number;
	rate: number;
	volume: number;
	matrix: ThreeDMatrix;
	nextTrackId: number;
};

export const parseMvhd = (data: Buffer): MvhdBox => {
	let offset = 0;

	const size = data.readUInt32BE(offset);
	offset += 4;
	const atom = data.subarray(offset, offset + 4);
	if (atom.toString() !== 'mvhd') {
		throw new Error(`Expected mvhd atom, got ${atom.toString('utf-8')}`);
	}

	offset += 4;
	const version = data.readUInt8(offset);
	if (version !== 0) {
		throw new Error(`Unsupported MVHD version ${version}`);
	}

	offset += 1;

	if (size !== 108) {
		throw new Error(`Expected mvhd size of version 0 to be 108, got ${size}`);
	}

	// Flags, we discard them
	data.subarray(offset, offset + 3);
	offset += 3;

	const creationTime = data.readUInt32BE(offset);
	offset += 4;

	const modificationTime = data.readUInt32BE(offset);
	offset += 4;

	const timeScale = data.readUInt32BE(offset);
	offset += 4;

	const durationInUnits = data.readUInt32BE(offset);
	const durationInSeconds = durationInUnits / timeScale;
	offset += 4;

	const rateArray = data.subarray(offset, offset + 4);
	const rate =
		rateArray[0] * 10 + rateArray[1] + rateArray[2] * 0.1 + rateArray[3] * 0.01;
	offset += 4;

	const volumeArray = data.subarray(offset, offset + 2);
	offset += 2;
	const volume = volumeArray[0] + volumeArray[1] * 0.1;

	// reserved 16bit
	offset += 2;

	// reserved 32bit x2
	offset += 4 * 2;

	// matrix
	const matrix: number[] = [];
	for (let i = 0; i < 9; i++) {
		matrix.push(data.readUInt32BE(offset));
		offset += 4;
	}

	// pre-defined
	offset += 4 * 6;

	// next track id
	const nextTrackId = data.readUInt32BE(offset);
	offset += 4;

	return {
		creationTime: creationTime === 0 ? null : 0,
		modificationTime: modificationTime === 0 ? null : 0,
		timeScale,
		durationInUnits,
		durationInSeconds,
		rate,
		volume,
		matrix: matrix as ThreeDMatrix,
		nextTrackId,
	};
};
