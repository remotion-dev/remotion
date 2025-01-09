import {combineUint8Arrays} from '../../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../../primitives';

export const createHdlr = (type: 'video' | 'audio' | 'mdir') => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('hdlr'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// pre_defined
			new Uint8Array([0, 0, 0, 0]),
			// handler_type
			stringsToUint8Array(
				type === 'mdir' ? 'mdir' : type === 'video' ? 'vide' : 'soun',
			),
			// reserved
			type === 'mdir'
				? numberTo32BitUIntOrInt(1634758764)
				: new Uint8Array([0, 0, 0, 0]),
			new Uint8Array([0, 0, 0, 0]),
			new Uint8Array([0, 0, 0, 0]),
			// name
			stringsToUint8Array(
				type === 'mdir'
					? '\0'
					: type === 'video'
						? 'VideoHandler\0'
						: 'SoundHandler\0',
			),
		]),
	);
};
