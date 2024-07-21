import {getArrayBufferIterator} from './buffer-iterator';
import {webReader} from './from-web';
import {parseVideo} from './parse-video';
import type {ReaderInterface} from './reader';

export const getVideoMetadata = async (
	src: string,
	readerInterface: ReaderInterface = webReader,
) => {
	const reader = await readerInterface.read(src, null);

	const iterator = getArrayBufferIterator(new Uint8Array([]));
	let parseResult = parseVideo(iterator);

	while (parseResult.status === 'incomplete') {
		const result = await reader.read();
		if (result.done) {
			break;
		}

		iterator.addData(result.value);
		parseResult = parseResult.continueParsing();
	}

	return parseResult.segments;
};
