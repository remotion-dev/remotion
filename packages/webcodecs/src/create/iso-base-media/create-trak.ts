import {truthy} from '../../truthy';
import {combineUint8Arrays} from '../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from './primitives';

export const createTrak = ({
	tkhd,
	mdia,
}: {
	tkhd: Uint8Array;
	mdia: Uint8Array;
}) => {
	return addSize(
		combineUint8Arrays(
			[
				// name
				stringsToUint8Array('trak'),
				// tkhd
				tkhd,

				// mdia
				mdia,
			].filter(truthy),
		),
	);
};
