import type {MetadataEntry} from '../../metadata/get-metadata';
import type {ParserState} from '../../state/parser-state';

function combine28Bits(a: number, b: number, c: number, d: number): number {
	// Mask each number to ignore first bit (& 0x7F)
	const val1 = a & 0x7f; // 7 bits from first byte
	const val2 = b & 0x7f; // 7 bits from second byte
	const val3 = c & 0x7f; // 7 bits from third byte
	const val4 = d & 0x7f; // 7 bits from fourth byte

	// Combine all values using bitwise operations
	return (val1 << 21) | (val2 << 14) | (val3 << 7) | val4;
}

export const parseId3 = ({state}: {state: ParserState}) => {
	const {iterator} = state;
	if (iterator.bytesRemaining() < 9) {
		return;
	}

	const {returnToCheckpoint} = iterator.startCheckpoint();
	iterator.discard(3);
	const versionMajor = iterator.getUint8();
	const versionMinor = iterator.getUint8();
	const flags = iterator.getUint8();
	const sizeArr = iterator.getSlice(4);
	const size = combine28Bits(sizeArr[0], sizeArr[1], sizeArr[2], sizeArr[3]);

	if (iterator.bytesRemaining() < size) {
		returnToCheckpoint();
		return;
	}

	const entries: MetadataEntry[] = [];

	const initial = iterator.counter.getOffset();
	while (iterator.counter.getOffset() < size + initial) {
		const name =
			versionMajor === 3 || versionMajor === 4
				? iterator.getByteString(4, true)
				: iterator.getByteString(3, true);
		if (name === '') {
			iterator.discard(size + initial - iterator.counter.getOffset());
			break;
		}

		const s =
			versionMajor === 4
				? iterator.getSyncSafeInt32()
				: versionMajor === 3
					? iterator.getUint32()
					: iterator.getUint24();
		if (versionMajor === 3 || versionMajor === 4) {
			iterator.getUint16(); // flags
		}

		let subtract = 0;
		if (!name.startsWith('W')) {
			iterator.getUint8(); // encoding
			subtract += 1;
		}

		if (name === 'APIC') {
			const {discardRest} = iterator.planBytes(s - subtract);
			const mimeType = iterator.readUntilNullTerminator();
			iterator.getUint16(); // picture type
			const description = iterator.readUntilNullTerminator();
			iterator.discard(1);
			const data = discardRest();
			state.images.addImage({
				data,
				description,
				mimeType,
			});
		} else {
			const information = iterator.getByteString(s - subtract, true);
			entries.push({
				key: name,
				value: information,
				trackId: null,
			});
		}
	}

	state.getMp3Structure().boxes.push({
		type: 'id3-header',
		flags,
		size,
		versionMajor,
		versionMinor,
		metatags: entries,
	});
};
