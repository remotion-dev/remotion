/* eslint-disable max-depth */
import type {BufferIterator} from '../../buffer-iterator';
import {hasTracks} from '../../get-tracks';
import type {
	AnySegment,
	IsoBaseMediaBox,
	ParseResult,
} from '../../parse-result';
import type {BoxAndNext, PartialMdatBox} from '../../parse-video';
import type {ParserContext} from '../../parser-context';
import {hasSkippedMdatProcessing} from '../../traversal';
import {parseEsds} from './esds/esds';
import {parseFtyp} from './ftyp';
import {makeBaseMediaTrack} from './make-track';
import {parseMdat} from './mdat/mdat';
import {parseMdhd} from './mdhd';
import {parseMoov} from './moov/moov';
import {parseMvhd} from './mvhd';
import {parseAv1C} from './stsd/av1c';
import {parseAvcc} from './stsd/avcc';
import {parseColorParameterBox} from './stsd/colr';
import {parseCtts} from './stsd/ctts';
import {parseHvcc} from './stsd/hvcc';
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

const getChildren = async ({
	boxType,
	iterator,
	bytesRemainingInBox,
	options,
	littleEndian,
}: {
	boxType: string;
	iterator: BufferIterator;
	bytesRemainingInBox: number;
	options: ParserContext;
	littleEndian: boolean;
}) => {
	const parseChildren =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'dims' ||
		boxType === 'wave' ||
		boxType === 'stsb';

	if (parseChildren) {
		const parsed = await parseBoxes({
			iterator,
			maxBytes: bytesRemainingInBox,
			allowIncompleteBoxes: false,
			initialBoxes: [],
			options,
			continueMdat: false,
			littleEndian,
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

export const parseMdatPartially = async ({
	iterator,
	boxSize,
	fileOffset,
	parsedBoxes,
	options,
}: {
	iterator: BufferIterator;
	boxSize: number;
	fileOffset: number;
	parsedBoxes: AnySegment[];
	options: ParserContext;
}): Promise<BoxAndNext> => {
	const box = await parseMdat({
		data: iterator,
		size: boxSize,
		fileOffset,
		existingBoxes: parsedBoxes,
		options,
	});

	if (
		box.samplesProcessed &&
		box.fileOffset + boxSize === iterator.counter.getOffset()
	) {
		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	return {
		type: 'partial-mdat-box',
		boxSize,
		fileOffset,
	};
};

export const processBox = async ({
	iterator,
	allowIncompleteBoxes,
	parsedBoxes,
	options,
	littleEndian,
}: {
	iterator: BufferIterator;
	allowIncompleteBoxes: boolean;
	parsedBoxes: AnySegment[];
	options: ParserContext;
	littleEndian: boolean;
}): Promise<BoxAndNext> => {
	const fileOffset = iterator.counter.getOffset();
	const bytesRemaining = iterator.bytesRemaining();

	const boxSizeRaw = iterator.getFourByteNumber(littleEndian);

	// If `boxSize === 1`, the 8 bytes after the box type are the size of the box.
	if (
		(boxSizeRaw === 1 && iterator.bytesRemaining() < 12) ||
		iterator.bytesRemaining() < 4
	) {
		iterator.counter.decrement(iterator.counter.getOffset() - fileOffset);
		if (allowIncompleteBoxes) {
			return {
				type: 'incomplete',
			};
		}

		throw new Error(
			`Expected box size of ${bytesRemaining}, got ${boxSizeRaw}. Incomplete boxes are not allowed.`,
		);
	}

	if (boxSizeRaw === 0) {
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

	const boxType = iterator.getByteString(4);

	const boxSize =
		boxSizeRaw === 1 ? iterator.getEightByteNumber(littleEndian) : boxSizeRaw;

	if (bytesRemaining < boxSize) {
		if (boxType === 'mdat') {
			const shouldSkip = options.canSkipVideoData || !hasTracks(parsedBoxes);

			if (shouldSkip) {
				const skipTo = fileOffset + boxSize;
				const bytesToSkip = skipTo - iterator.counter.getOffset();

				// If there is a huge mdat chunk, we can skip it because we don't need it for the metadata
				if (bytesToSkip > 1_000_000) {
					return {
						type: 'complete',
						box: {
							type: 'mdat-box',
							boxSize,
							fileOffset,
							samplesProcessed: false,
						},
						size: boxSize,
						skipTo: fileOffset + boxSize,
					};
				}
			} else {
				return parseMdatPartially({
					iterator,
					boxSize,
					fileOffset,
					parsedBoxes,
					options,
				});
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

	if (boxType === 'ftyp') {
		const box = parseFtyp({iterator, size: boxSize, offset: fileOffset});
		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'colr') {
		const box = parseColorParameterBox({
			iterator,
		});
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
		const box = await parseStsd({
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

	if (boxType === 'stco' || boxType === 'co64') {
		const box = parseStco({
			iterator,
			offset: fileOffset,
			size: boxSize,
			mode64Bit: boxType === 'co64',
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
		const box = await parseMebx({
			iterator,
			offset: fileOffset,
			size: boxSize,
			options,
			littleEndian,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'moov') {
		const box = await parseMoov({
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
		const box = await parseTrak({
			data: iterator,
			size: boxSize,
			offsetAtStart: fileOffset,
			options,
		});
		const transformedTrack = makeBaseMediaTrack(box);
		if (transformedTrack) {
			if (transformedTrack.type === 'audio') {
				const callback = await options.onAudioTrack?.(transformedTrack);
				await options.parserState.registerAudioSampleCallback(
					transformedTrack.trackId,
					callback ?? null,
				);
			}

			if (transformedTrack.type === 'video') {
				const callback = await options.onVideoTrack?.(transformedTrack);
				await options.parserState.registerVideoSampleCallback(
					transformedTrack.trackId,
					callback ?? null,
				);
			}
		}

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

	if (boxType === 'av1C') {
		const box = parseAv1C({
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
		const box = await parseMdat({
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

	const children = await getChildren({
		boxType,
		iterator,
		bytesRemainingInBox,
		options,
		littleEndian,
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

export const parseBoxes = async ({
	iterator,
	maxBytes,
	allowIncompleteBoxes,
	initialBoxes,
	options,
	continueMdat,
	littleEndian,
}: {
	iterator: BufferIterator;
	maxBytes: number;
	allowIncompleteBoxes: boolean;
	initialBoxes: IsoBaseMediaBox[];
	options: ParserContext;
	continueMdat: false | PartialMdatBox;
	littleEndian: boolean;
}): Promise<ParseResult> => {
	let boxes: IsoBaseMediaBox[] = initialBoxes;
	const initialOffset = iterator.counter.getOffset();
	const alreadyHasMdat = boxes.find((b) => b.type === 'mdat-box');

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const result = continueMdat
			? await parseMdatPartially({
					iterator,
					boxSize: continueMdat.boxSize,
					fileOffset: continueMdat.fileOffset,
					parsedBoxes: initialBoxes,
					options,
				})
			: await processBox({
					iterator,
					allowIncompleteBoxes,
					parsedBoxes: initialBoxes,
					options,
					littleEndian,
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
						continueMdat: false,
						littleEndian,
					});
				},
				skipTo: null,
			};
		}

		if (result.type === 'partial-mdat-box') {
			return {
				status: 'incomplete',
				segments: boxes,
				continueParsing: () => {
					return Promise.resolve(
						parseBoxes({
							iterator,
							maxBytes,
							allowIncompleteBoxes,
							initialBoxes: boxes,
							options,
							continueMdat: result,
							littleEndian,
						}),
					);
				},
				skipTo: null,
			};
		}

		if (result.box.type === 'mdat-box' && alreadyHasMdat) {
			boxes = boxes.filter((b) => b.type !== 'mdat-box');
			boxes.push(result.box);
			break;
		} else {
			boxes.push(result.box);
		}

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
						continueMdat: false,
						littleEndian,
					});
				},
				skipTo: result.skipTo,
			};
		}

		iterator.discardFirstBytes();
	}

	const mdatState = hasSkippedMdatProcessing(boxes);
	if (mdatState.skipped && !options.canSkipVideoData) {
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
					continueMdat: false,
					littleEndian,
				});
			},
			skipTo: mdatState.fileOffset,
		};
	}

	return {
		status: 'done',
		segments: boxes,
	};
};
