import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../../log';
import type {BaseBox} from '../base-type';
import type {Sample} from './samples';
import {parseIsoFormatBoxes} from './samples';

export interface StsdBox extends BaseBox {
	type: 'stsd-box';
	numberOfEntries: number;
	samples: Sample[];
}

export const parseStsd = async ({
	offset,
	size,
	iterator,
	logLevel,
	contentLength,
}: {
	offset: number;
	size: number;
	iterator: BufferIterator;
	logLevel: MediaParserLogLevel;
	contentLength: number;
}): Promise<StsdBox> => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	// flags, we discard them
	iterator.discard(3);

	const numberOfEntries = iterator.getUint32();

	const bytesRemainingInBox = size - (iterator.counter.getOffset() - offset);

	const boxes = await parseIsoFormatBoxes({
		maxBytes: bytesRemainingInBox,
		logLevel,
		iterator,
		contentLength,
	});

	if (boxes.length !== numberOfEntries) {
		throw new Error(
			`Expected ${numberOfEntries} sample descriptions, got ${boxes.length}`,
		);
	}

	return {
		type: 'stsd-box',
		boxSize: size,
		offset,
		numberOfEntries,
		samples: boxes,
	};
};
