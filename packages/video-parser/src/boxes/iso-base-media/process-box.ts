import type {IsoBaseMediaBox, ParseResult} from '../../parse-result';
import type {BoxAndNext} from '../../parse-video';
import type {BufferIterator} from '../../read-and-increment-offset';
import {parseFtyp} from './ftyp';
import {parseMoov} from './moov/moov';
import {parseMvhd} from './mvhd';
import {parseMebx} from './stsd/mebx';
import {parseStsd} from './stsd/stsd';
import {parseTkhd} from './tkhd';
import {parseTrak} from './trak/trak';

const getChildren = ({
	boxType,
	iterator,
	bytesRemainingInBox,
}: {
	boxType: string;
	iterator: BufferIterator;
	bytesRemainingInBox: number;
}) => {
	const parseChildren =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'dims' ||
		boxType === 'stsb';

	if (parseChildren) {
		const parsed = parseBoxes({
			iterator,
			maxBytes: bytesRemainingInBox,
			allowIncompleteBoxes: false,
		});

		if (parsed.status === 'incomplete') {
			throw new Error('Incomplete boxes are not allowed');
		}

		return parsed.segments;
	}

	iterator.discard(bytesRemainingInBox);
	return [];
};

const processBox = ({
	iterator,
	allowIncompleteBoxes,
}: {
	iterator: BufferIterator;
	allowIncompleteBoxes: boolean;
}): BoxAndNext => {
	const fileOffset = iterator.counter.getOffset();
	const bytesRemaining = iterator.bytesRemaining();

	const boxSize = iterator.getFourByteNumber();
	if (boxSize === 0) {
		throw new Error(`Expected box size of not 0, got ${boxSize}`);
	}

	if (bytesRemaining < boxSize) {
		iterator.counter.decrement(boxSize);
		if (allowIncompleteBoxes) {
			return {
				type: 'incomplete',
			};
		}

		throw new Error(
			`Expected box size of ${bytesRemaining}, got ${boxSize}. Incomplete boxes are not allowed.`,
		);
	}

	const boxType = iterator.getByteString(4);

	if (boxType === 'ftyp') {
		iterator.counter.decrement(8);
		const box = parseFtyp(iterator);
		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'mvhd') {
		iterator.counter.decrement(8);
		const box = parseMvhd(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'tkhd') {
		iterator.counter.decrement(8);
		const box = parseTkhd(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'stsd') {
		iterator.counter.decrement(8);
		const box = parseStsd(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'mebx') {
		iterator.counter.decrement(8);
		const box = parseMebx(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'moov') {
		iterator.counter.decrement(8);
		const box = parseMoov(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'trak') {
		iterator.counter.decrement(8);
		const box = parseTrak(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	const bytesRemainingInBox =
		boxSize - (iterator.counter.getOffset() - fileOffset);

	const children = getChildren({
		boxType,
		iterator,
		bytesRemainingInBox,
	});

	return {
		type: 'complete',
		box: {
			type: 'regular-box',
			boxType,
			boxSize,
			children,
			offset: fileOffset,
		},
		size: boxSize,
	};
};

export const parseBoxes = ({
	iterator,
	maxBytes,
	allowIncompleteBoxes,
}: {
	iterator: BufferIterator;
	maxBytes: number;
	allowIncompleteBoxes: boolean;
}): ParseResult => {
	const boxes: IsoBaseMediaBox[] = [];
	const initialOffset = iterator.counter.getOffset();

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const result = processBox({
			iterator,
			allowIncompleteBoxes,
		});
		if (result.type === 'incomplete') {
			return {
				status: 'incomplete',
				segments: boxes,
			};
		}

		boxes.push(result.box);
	}

	return {
		status: 'done',
		segments: boxes,
	};
};
