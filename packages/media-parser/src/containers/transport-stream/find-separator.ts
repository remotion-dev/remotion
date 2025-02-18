import type {TransportStreamEntry} from './parse-pmt';

function findNthSubarrayIndex(
	array: Uint8Array,
	subarray: Uint8Array,
	n: number,
) {
	const subarrayLength = subarray.length;
	const arrayLength = array.length;
	let count = 0;

	for (let i = 0; i <= arrayLength - subarrayLength; i++) {
		let match = true;
		for (let j = 0; j < subarrayLength; j++) {
			if (array[i + j] !== subarray[j]) {
				match = false;
				break;
			}
		}

		if (match) {
			count++;
			if (count === n) {
				return i; // Return the starting index of the nth subarray
			}
		}
	}

	return -1; // Return -1 if nth subarray is not found
}

export const findNextSeparator = ({
	restOfPacket,
	transportStreamEntry,
}: {
	restOfPacket: Uint8Array;
	transportStreamEntry: TransportStreamEntry;
}) => {
	if (transportStreamEntry.streamType === 27) {
		return findNthSubarrayIndex(restOfPacket, new Uint8Array([0, 0, 1, 9]), 2);
	}

	throw new Error(`Unsupported stream ID ${transportStreamEntry.streamType}`);
};
