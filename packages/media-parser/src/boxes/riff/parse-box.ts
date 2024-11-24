import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult, RiffStructure} from '../../parse-result';
import {expectRiffBox} from './expect-riff-box';

export const parseRiffBody = ({
	iterator,
	structure,
	maxOffset,
}: {
	iterator: BufferIterator;
	structure: RiffStructure;
	maxOffset: number;
}): ParseResult<RiffStructure> => {
	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() < maxOffset
	) {
		const result = expectRiffBox({iterator, boxes: structure.boxes});
		if (result.type === 'incomplete') {
			return {
				status: 'incomplete',
				continueParsing() {
					return Promise.resolve(
						parseRiffBody({iterator, structure, maxOffset}),
					);
				},
				segments: structure,
				skipTo: null,
			};
		}

		structure.boxes.push(result.box);
	}

	return {
		status: 'done',
		segments: structure,
	};
};

export const parseRiff = (
	iterator: BufferIterator,
): ParseResult<RiffStructure> => {
	const structure: RiffStructure = {type: 'riff', boxes: []};
	const riff = iterator.getByteString(4);
	if (riff !== 'RIFF') {
		throw new Error('Not a RIFF file');
	}

	const size = iterator.getUint32Le();
	const fileType = iterator.getByteString(4);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		throw new Error(`File type ${fileType} not supported`);
	}

	structure.boxes.push({type: 'riff-header', fileSize: size, fileType});

	return parseRiffBody({iterator, structure, maxOffset: Infinity});
};
