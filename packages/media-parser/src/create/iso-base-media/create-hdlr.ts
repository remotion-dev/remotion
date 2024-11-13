import {combineUint8Arrays} from '../../boxes/webm/make-header';
import {addSize, stringsToUint8Array} from './primitives';

export const createHdlr = (type: 'video' | 'audio') => {
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
			stringsToUint8Array(type === 'video' ? 'vide' : 'soun'),
			// reserved
			new Uint8Array([0, 0, 0, 0]),
			new Uint8Array([0, 0, 0, 0]),
			new Uint8Array([0, 0, 0, 0]),
			// name
			stringsToUint8Array(
				type === 'video' ? 'VideoHandler\0' : 'SoundHandler\0',
			),
		]),
	);
};
