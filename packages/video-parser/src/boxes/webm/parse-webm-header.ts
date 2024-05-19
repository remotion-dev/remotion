import {getArrayBufferIterator} from '../../read-and-increment-offset';

export const parseWebmHeader = (data: ArrayBuffer) => {
	const counter = getArrayBufferIterator(data, 4);
	const length = counter.getEBML();

	if (length !== 31) {
		throw new Error(`Expected header length 31, got ${length}`);
	}
};
