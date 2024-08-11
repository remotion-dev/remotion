/* eslint-disable max-depth */
import type {BufferIterator} from '../../buffer-iterator';
import {hasTracks} from '../../get-tracks';
import type {
	AnySegment,
	IsoBaseMediaBox,
	ParseResult,
} from '../../parse-result';
import type {BoxAndNext} from '../../parse-video';
import type {ParserContext} from '../../parser-context';
import {parseEsds} from './esds/esds';
import {parseFtyp} from './ftyp';
import {parseMdat} from './mdat/mdat';
import {parseMdhd} from './mdhd';
import {parseMoov} from './moov/moov';
import {parseMvhd} from './mvhd';
import {parseAvcc, parseHvcc} from './stsd/avcc-hvcc';
import {parseCtts} from './stsd/ctts';
import {parseMebx} from './stsd/mebx';
import {parsePasp} from './stsd/pasp';
import {parseStco} from './stsd/stco';
import {parseStsc} from './stsd/stsc';
import {parseStsd} from './stsd/stsd';
import {parseStss} from './stsd/stss';
import {parseStsz} from './stsd/stsz';
import {parseStts} from './stsd/stts';
import {parseTkhd} from './tkhd';
import {parseTrak} from './trak/trak';

const getChildren = ({
	boxType,
	iterator,
	bytesRemainingInBox,
	options,
}: {
	boxType: string;
	iterator: BufferIterator;
	bytesRemainingInBox: number;
	options: ParserContext;
}) => {
	const parseChildren =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'dims' ||
		boxType === 'wave' ||
		boxType === 'stsb';

	if (parseChildren) {
		const parsed = parseBoxes({
			iterator,
			maxBytes: bytesRemainingInBox,
			allowIncompleteBoxes: false,
			initialBoxes: [],
			options,
		});

		if (parsed.status === 'incomplete') {
			throw new Error('Incomplete boxes are not allowed');
		}

		return parsed.segments;
	}

	if (bytesRemainingInBox < 0) {
		throw new Error('Box size is too big ' + JSON.stringify({boxType}));
	}

	iterator.discard(bytesRemainingInBox);
	return [];
};

const processBox = ({
	iterator,
	allowIncompleteBoxes,
	parsedBoxes,
	options,
}: {
	iterator: BufferIterator;
	allowIncompleteBoxes: boolean;
	parsedBoxes: AnySegment[];
	options: ParserContext;
}): BoxAndNext => {
	const fileOffset = iterator.counter.getOffset();
	const bytesRemaining = iterator.bytesRemaining();

	const boxSize = iterator.getFourByteNumber();
	if (boxSize === 0) {
		return {
			type: 'complete',
			box: {
				type: 'void-box',
				boxSize: 0,
			},
			size: 4,
			skipTo: null,
		};
	}

	if (bytesRemaining < boxSize) {
		if (bytesRemaining >= 4) {
			const type = iterator.getByteString(4);
			iterator.counter.decrement(4);

			if (type === 'mdat') {
				const shouldSkip = options.canSkipVideoData || !hasTracks(parsedBoxes);
				if (shouldSkip) {
					const skipTo = fileOffset + boxSize;
					const bytesToSkip = skipTo - iterator.counter.getOffset();

					// If there is a huge mdat chunk, we can skip it because we don't need it for the metadata
					if (bytesToSkip > 1_000_000) {
						return {
							type: 'complete',
							box: {
								type: 'regular-box',
								boxType: 'mdat',
								children: [],
								boxSize,
								offset: fileOffset,
							},
							size: boxSize,
							skipTo: fileOffset + boxSize,
						};
					}
				}
			}
		}

		iterator.counter.decrement(iterator.counter.getOffset() - fileOffset);
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
		const box = parseFtyp({iterator, size: boxSize, offset: fileOffset});
		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'mvhd') {
		const box = parseMvhd({iterator, offset: fileOffset, size: boxSize});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'tkhd') {
		const box = parseTkhd({iterator, offset: fileOffset, size: boxSize});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'stsd') {
		const box = parseStsd({
			iterator,
			offset: fileOffset,
			size: boxSize,
			options,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'stsz') {
		const box = parseStsz({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'stco') {
		const box = parseStco({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'pasp') {
		const box = parsePasp({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'stss') {
		const box = parseStss({
			iterator,
			offset: fileOffset,
			boxSize,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'ctts') {
		const box = parseCtts({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'stsc') {
		const box = parseStsc({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'mebx') {
		const box = parseMebx({
			iterator,
			offset: fileOffset,
			size: boxSize,
			options,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'moov') {
		const box = parseMoov({
			iterator,
			offset: fileOffset,
			size: boxSize,
			options,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'trak') {
		const box = parseTrak({
			data: iterator,
			size: boxSize,
			offsetAtStart: fileOffset,
			options,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'stts') {
		const box = parseStts({
			data: iterator,
			size: boxSize,
			fileOffset,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'avcC') {
		const box = parseAvcc({
			data: iterator,
			size: boxSize,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'hvcC') {
		const box = parseHvcc({
			data: iterator,
			size: boxSize,
			offset: fileOffset,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'mdhd') {
		const box = parseMdhd({
			data: iterator,
			size: boxSize,
			fileOffset,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'esds') {
		const box = parseEsds({
			data: iterator,
			size: boxSize,
			fileOffset,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'mdat') {
		const box = parseMdat({
			data: iterator,
			size: boxSize,
			fileOffset,
			existingBoxes: parsedBoxes,
			options,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	const bytesRemainingInBox =
		boxSize - (iterator.counter.getOffset() - fileOffset);

	const children = getChildren({
		boxType,
		iterator,
		bytesRemainingInBox,
		options,
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
		skipTo: null,
	};
};

export const parseBoxes = ({
	iterator,
	maxBytes,
	allowIncompleteBoxes,
	initialBoxes,
	options,
}: {
	iterator: BufferIterator;
	maxBytes: number;
	allowIncompleteBoxes: boolean;
	initialBoxes: IsoBaseMediaBox[];
	options: ParserContext;
}): ParseResult => {
	const boxes: IsoBaseMediaBox[] = initialBoxes;
	const initialOffset = iterator.counter.getOffset();

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const result = processBox({
			iterator,
			allowIncompleteBoxes,
			parsedBoxes: initialBoxes,
			options,
		});
		if (result.type === 'incomplete') {
			if (Number.isFinite(maxBytes)) {
				throw new Error('maxBytes must be Infinity for top-level boxes');
			}

			return {
				status: 'incomplete',
				segments: boxes,
				continueParsing: () => {
					return parseBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes: boxes,
						options,
					});
				},
				skipTo: null,
			};
		}

		boxes.push(result.box);

		if (result.skipTo !== null) {
			return {
				status: 'incomplete',
				segments: boxes,
				continueParsing: () => {
					return parseBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes: boxes,
						options,
					});
				},
				skipTo: result.skipTo,
			};
		}

		iterator.discardFirstBytes();
	}

	return {
		status: 'done',
		segments: boxes,
	};
};
