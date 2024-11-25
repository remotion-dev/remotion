import type {BufferIterator} from '../../buffer-iterator';
import {getArrayBufferIterator} from '../../buffer-iterator';

const readSps = (iterator: BufferIterator) => {
	const profile = iterator.getUint8();
	iterator.discard(1);
	const level = iterator.getUint8();
	return {
		profile,
		level,
	};
};

type AvcInfo =
	| {
			profile: number;
			level: number;
			type: 'avc-profile';
	  }
	| {
			type: 'keyframe';
	  }
	| {
			type: 'delta-frame';
	  };

const inspect = (buffer: Uint8Array): AvcInfo | null => {
	const iterator = getArrayBufferIterator(buffer, buffer.byteLength);
	iterator.startReadingBits();
	iterator.getBits(1);
	iterator.getBits(2);
	const type = iterator.getBits(5);
	iterator.stopReadingBits();
	if (type === 7) {
		const sps = readSps(iterator);
		return {
			level: sps.level,
			profile: sps.profile,
			type: 'avc-profile',
		};
	}

	if (type === 5) {
		return {
			type: 'keyframe',
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
			const info = inspect(buffer.slice(i + 1, i + 100));
			if (info) {
				infos.push(info);
				if (info.type === 'keyframe' || info.type === 'delta-frame') {
					break;
				}
			}
		}

		zeroesInARow = 0;
	}

	return infos;
};
