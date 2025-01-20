import type {TransportStreamEntry} from './parse-pmt';

function findSubarrayIndex(array: Uint8Array, subarray: Uint8Array) {
	const subarrayLength = subarray.length;
	const arrayLength = array.length;

	for (let i = 0; i <= arrayLength - subarrayLength; i++) {
		let match = true;
		for (let j = 0; j < subarrayLength; j++) {
			if (array[i + j] !== subarray[j]) {
				match = false;
				break;
			}
		}

		if (match) {
			if (subarray[i - 1] === 0) {
				i--;
			}

			return i; // Return the starting index of the subarray
		}
	}

	return -1; // Return -1 if subarray is not found
}

export const findNextSeparator = (
	restOfPacket: Uint8Array,
	transportStreamEntry: TransportStreamEntry,
) => {
	if (transportStreamEntry.streamType === 27) {
		return findSubarrayIndex(restOfPacket, new Uint8Array([0, 0, 1, 9]));
	}

	throw new Error(`Unsupported stream ID ${transportStreamEntry.streamType}`);
};
