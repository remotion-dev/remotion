import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {FlacVorbisComment} from './types';

export const parseVorbisComment = ({
	state,
	iterator,
	size,
}: {
	state: ParserState;
	iterator: BufferIterator;
	size: number;
}): Promise<ParseResult> => {
	const {expectNoMoreBytes} = iterator.startBox(size);

	const box: FlacVorbisComment = {
		type: 'flac-vorbis-comment',
		fields: [],
	};

	const vendorLength = iterator.getUint32Le();
	const vendorString = iterator.getByteString(vendorLength, true);
	const numberOfFields = iterator.getUint32Le();

	box.fields.push({key: 'vendor', value: vendorString, trackId: null});

	for (let i = 0; i < numberOfFields; i++) {
		const fieldLength = iterator.getUint32Le();
		const field = iterator.getByteString(fieldLength, true);
		const [key, value] = field.split('=');
		box.fields.push({key: key.toLowerCase(), value, trackId: null});
	}

	state.getFlacStructure().boxes.push(box);

	expectNoMoreBytes();

	return Promise.resolve(null);
};
