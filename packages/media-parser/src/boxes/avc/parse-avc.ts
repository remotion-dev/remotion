import type {BufferIterator} from '../../buffer-iterator';
import {getArrayBufferIterator} from '../../buffer-iterator';

const readSps = (iterator: BufferIterator) => {
	const profile = iterator.getUint8();
	const compatibility = iterator.getUint8();
	const level = iterator.getUint8();
	return {
		profile,
		compatibility,
		level,
	};
};

export type AvcProfileInfo = {
	profile: number;
	level: number;
	compatibility: number;
	sps: Uint8Array;
	type: 'avc-profile';
};

export type AvcPPs = {
	type: 'avc-pps';
	pps: Uint8Array;
};

type AvcInfo =
	| AvcProfileInfo
	| AvcPPs
	| {
			type: 'keyframe';
	  }
	| {
			type: 'delta-frame';
	  };

const findEnd = (buffer: Uint8Array) => {
	let zeroesInARow = 0;
	for (let i = 0; i < buffer.length; i++) {
		const val = buffer[i];

		if (val === 0) {
			zeroesInARow++;
			continue;
		}

		if (zeroesInARow >= 2 && val === 1) {
			return i - zeroesInARow;
		}

		zeroesInARow = 0;
	}

	return null;
};

const inspect = (buffer: Uint8Array): AvcInfo | null => {
	const iterator = getArrayBufferIterator(buffer, buffer.byteLength);
	iterator.startReadingBits();
	iterator.getBits(1);
	iterator.getBits(2);
	const type = iterator.getBits(5);
	iterator.stopReadingBits();
	if (type === 7) {
		const end = findEnd(buffer);
		const data = readSps(iterator);
		const sps = buffer.slice(1, end === null ? Infinity : end);

		return {
			level: data.level,
			profile: data.profile,
			compatibility: data.compatibility,
			sps,
			type: 'avc-profile',
		};
	}

	if (type === 5) {
		return {
			type: 'keyframe',
		};
	}

	if (type === 8) {
		const end = findEnd(buffer);
		const pps = buffer.slice(0, end === null ? Infinity : end);

		return {
			type: 'avc-pps',
			pps,
		};
	}

	if (type === 1) {
		return {
			type: 'delta-frame',
		};
	}

	iterator.destroy();
	return null;
};

// https://stackoverflow.com/questions/24884827/possible-locations-for-sequence-picture-parameter-sets-for-h-264-stream
export const parseAvc = (buffer: Uint8Array): AvcInfo[] => {
	let zeroesInARow = 0;
	const infos: AvcInfo[] = [];

	for (let i = 0; i < buffer.length; i++) {
		const val = buffer[i];

		if (val === 0) {
			zeroesInARow++;
			continue;
		}

		if (zeroesInARow >= 2 && val === 1) {
			zeroesInARow = 0;
			const info = inspect(buffer.slice(i + 1, i + 100));
			if (info) {
				infos.push(info);
				if (info.type === 'keyframe' || info.type === 'delta-frame') {
					break;
				}
			}
		}

		if (val !== 1) {
			zeroesInARow = 0;
		}
	}

	return infos;
};
