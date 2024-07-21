import {createReadStream} from 'fs';
import {getArrayBufferIterator} from './buffer-iterator';
import {parseVideo} from './parse-video';

export const readFromNode = async (src: string) => {
	const stream = createReadStream(src);

	const iterator = getArrayBufferIterator(new Uint8Array([]));
	let parseResult = parseVideo(iterator);

	for await (const chunk of stream) {
		if (parseResult.status === 'done') {
			break;
		}

		iterator.addData(chunk);
		parseResult = parseResult.continueParsing();
	}

	return parseResult;
};
