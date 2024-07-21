import {getArrayBufferIterator} from './buffer-iterator';
import {webReader} from './from-web';
import type {Dimensions} from './get-dimensions';
import {getDimensions} from './get-dimensions';
import {getDuration} from './get-duration';
import type {AnySegment} from './parse-result';
import {parseVideo} from './parse-video';
import type {ReaderInterface} from './reader';

export type Options<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
> = {
	dimensions?: EnableDimensions;
	durationInSeconds?: EnableDuration;
	boxes?: EnableBoxes;
};

type Metadata<
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
> = (EnableDimensions extends true ? {dimensions: Dimensions} : {}) &
	(EnableDuration extends true ? {durationInSeconds: number | null} : {}) &
	(EnableBoxes extends true ? {boxes: AnySegment[]} : {});

export const getVideoMetadata = async <
	EnableDimensions extends boolean,
	EnableDuration extends boolean,
	EnableBoxes extends boolean,
>(
	src: string,
	options: Options<EnableDimensions, EnableDuration, EnableBoxes>,
	readerInterface: ReaderInterface = webReader,
): Promise<Metadata<EnableDimensions, EnableDuration, EnableBoxes>> => {
	const reader = await readerInterface.read(src, null);

	const returnValue = {} as Metadata<true, true, true>;

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

	if (options.dimensions) {
		returnValue.dimensions = getDimensions(parseResult.segments);
	}

	if (options.durationInSeconds) {
		returnValue.durationInSeconds = getDuration(parseResult.segments);
	}

	if (options.boxes) {
		returnValue.boxes = parseResult.segments;
	}

	return returnValue;
};
