import type {BufferIterator} from './buffer-iterator';
import {getArrayBufferIterator} from './buffer-iterator';
import {webReader} from './from-web';
import {getAudioCodec} from './get-audio-codec';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import {getFps} from './get-fps';
import {getVideoCodec} from './get-video-codec';
import {hasAllInfo} from './has-all-info';
import type {Metadata, ParseMedia} from './options';
import type {ParseResult} from './parse-result';
import {parseVideo} from './parse-video';

export const parseMedia: ParseMedia = async (
	src,
	options,
	readerInterface = webReader,
) => {
	const reader = await readerInterface.read(src, null);

	const returnValue = {} as Metadata<true, true, true, true, true, true>;

	let iterator: BufferIterator | null = null;
	let parseResult: ParseResult | null = null;

	while (parseResult === null || parseResult.status === 'incomplete') {
		const result = await reader.read();
		if (result.done) {
			break;
		}

		if (iterator) {
			iterator.addData(result.value);
		} else {
			iterator = getArrayBufferIterator(result.value);
		}

		if (parseResult) {
			parseResult = parseResult.continueParsing();
		} else {
			parseResult = parseVideo(iterator);
		}

		if (hasAllInfo(options, parseResult)) {
			if (!reader.closed) {
				reader.cancel(new Error('has all information'));
			}

			break;
		}
	}

	if (!parseResult) {
		throw new Error('Could not parse video');
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

	if (options.videoCodec) {
		returnValue.videoCodec = getVideoCodec(parseResult.segments);
	}

	if (options.audioCodec) {
		returnValue.audioCodec = getAudioCodec(parseResult.segments);
	}

	if (options.boxes) {
		returnValue.boxes = parseResult.segments;
	}

	return returnValue;
};
