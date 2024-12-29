import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

type KeysEntry = {
	keySize: number;
	namespace: string;
	value: string;
};

export interface KeysBox extends BaseBox {
	type: 'keys-box';
	version: number;
	entryCount: number;
	entries: KeysEntry[];
}

export const parseKeys = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): KeysBox => {
	const box = iterator.startBox(size - 8);
	const version = iterator.getUint8();
	// flags
	iterator.discard(3);
	// entry_count
	const entryCount = iterator.getUint32();

	const entries: KeysEntry[] = [];
	for (let i = 0; i < entryCount; i++) {
		// key_size
		const keySize = iterator.getUint32();
		const namespace = iterator.getAtom();
		const value = iterator.getByteString(keySize - 8, false);
		// data
		const entry: KeysEntry = {
			keySize,
			namespace,
			value,
		};
		entries.push(entry);
	}

	box.discardRest();

	return {
		type: 'keys-box',
		boxSize: size,
		offset,
		version,
		entryCount,
		entries,
	};
};
