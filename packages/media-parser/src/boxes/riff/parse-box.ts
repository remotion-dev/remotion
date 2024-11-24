import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {expectRiffBox} from './expect-riff-box';
import type {RiffBox} from './riff-box';

export const parseRiffBody = ({
	iterator,
	boxes,
	maxOffset,
}: {
	iterator: BufferIterator;
	boxes: RiffBox[];
	maxOffset: number;
}): ParseResult => {
	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() < maxOffset
	) {
		const result = expectRiffBox({iterator, boxes});
		if (result.type === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing() {
					return Promise.resolve(parseRiffBody({iterator, boxes, maxOffset}));
				},
				segments: boxes,
				skipTo: null,
			};
		}

		boxes.push(result.box);
	}

	return {
		status: 'done',
		segments: boxes,
	};
};

export const parseRiff = (iterator: BufferIterator): ParseResult => {
	const boxes: RiffBox[] = [];
	const riff = iterator.getByteString(4);
	if (riff !== 'RIFF') {
		throw new Error('Not a RIFF file');
	}

	const size = iterator.getUint32Le();
	const fileType = iterator.getByteString(4);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		throw new Error(`File type ${fileType} not supported`);
	}

	boxes.push({type: 'riff-header', fileSize: size, fileType});

	return parseRiffBody({iterator, boxes, maxOffset: Infinity});
};
