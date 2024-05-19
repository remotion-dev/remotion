import {getArrayBufferIterator} from '../../read-and-increment-offset';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebmHeader = (data: ArrayBuffer) => {
	const counter = getArrayBufferIterator(data, 4);
	const length = counter.getEBML();

	if (length !== 31) {
		throw new Error(`Expected header length 31, got ${length}`);
	}

	// Discard header for now
	counter.discard(31);

	const magic = counter.getSlice(4);
	// "We find 18 53 80 67."
	// We are done with the generic EBML fields and now come to the Matroska fields.
	if (new Uint8Array(magic).join() !== [0x18, 0x53, 0x80, 0x67].join()) {
		throw new Error(
			'Expected "EBML" magic fields, got ' + new Uint8Array(magic).join(),
		);
	}
};
