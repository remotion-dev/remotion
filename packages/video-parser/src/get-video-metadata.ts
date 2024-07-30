import {getArrayBufferIterator} from './buffer-iterator';
import {webReader} from './from-web';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import {getFps} from './get-fps';
import {hasAllInfo} from './has-all-info';
import type {Metadata, ParseMedia} from './options';
import {parseVideo} from './parse-video';

export const parseMedia: ParseMedia = async (
	src,
	options,
	readerInterface = webReader,
) => {
	const reader = await readerInterface.read(src, null);

	const returnValue = {} as Metadata<true, true, true, true>;

	const iterator = getArrayBufferIterator(new Uint8Array([]));
	let parseResult = parseVideo(iterator);

	while (parseResult.status === 'incomplete') {
		const result = await reader.read();
		if (result.done) {
			break;
		}

		iterator.addData(result.value);
		parseResult = parseResult.continueParsing();

		if (hasAllInfo(options, parseResult)) {
			if (!reader.closed) {
				reader.cancel(new Error('has all information'));
			}

			break;
		}
	}

	if (options.dimensions) {
		returnValue.dimensions = getDimensions(parseResult.segments);
	}

	if (options.durationInSeconds) {
		returnValue.durationInSeconds = getDuration(parseResult.segments);
	}

	if (options.fps) {
		returnValue.fps = getFps(parseResult.segments);
	}

	if (options.boxes) {
		returnValue.boxes = parseResult.segments;
	}

	return returnValue;
};
