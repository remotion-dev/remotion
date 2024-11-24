import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {expectRiffBox} from './expect-riff-box';
import type {RiffBox} from './riff-box';

const parseRiffBody = ({
	iterator,
	boxes,
}: {
	iterator: BufferIterator;
	boxes: RiffBox[];
}): Promise<ParseResult> => {
	while (iterator.bytesRemaining() > 0) {
		const result = expectRiffBox({iterator, boxes});
		if (result.type === 'incomplete') {
			return Promise.resolve({
				status: 'incomplete',
				continueParsing() {
					return parseRiffBody({iterator, boxes});
				},
				segments: boxes,
				skipTo: null,
			});
		}

		boxes.push(result.box);
	}

	return Promise.resolve({
		status: 'done',
		segments: boxes,
	});
};

export const parseRiff = (iterator: BufferIterator): Promise<ParseResult> => {
	const boxes: RiffBox[] = [];
	const riff = iterator.getByteString(4);
	if (riff !== 'RIFF') {
		return Promise.reject(new Error('Not a RIFF file'));
	}

	const size = iterator.getUint32Le();
	const fileType = iterator.getByteString(4);
	if (fileType !== 'WAVE' && fileType !== 'AVI') {
		return Promise.reject(new Error(`File type ${fileType} not supported`));
	}

	boxes.push({type: 'riff-header', fileSize: size, fileType});

	return parseRiffBody({iterator, boxes});
};
