import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

export interface HdlrBox extends BaseBox {
	type: 'hdlr-box';
	hdlrType: string;
	componentName: string;
}
export const parseHdlr = ({
	iterator,
	size,
	offset,
}: {
	iterator: BufferIterator;
	size: number;
	offset: number;
}): Promise<HdlrBox> => {
	const box = iterator.startBox(size - 8);
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported hdlr version: ${version}`);
	}

	// version
	iterator.discard(3);
	// predefined
	iterator.discard(4);
	// type
	const hdlrType = iterator.getByteString(4, false);
	// component manufactor
	iterator.discard(4);
	// component flags
	iterator.discard(4);
	// component flags mask
	iterator.discard(4);
	// component name
	const componentName = iterator.readUntilNullTerminator();
	box.discardRest();

	return Promise.resolve({
		type: 'hdlr-box',
		boxSize: size,
		offset,
		hdlrType,
		componentName,
	});
};
