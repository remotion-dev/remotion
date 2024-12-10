import type {BufferIterator} from '../../buffer-iterator';
import {hasTracks} from '../../get-tracks';
import {hasAllInfo} from '../../has-all-info';
import type {LogLevel} from '../../log';
import type {Options, ParseMediaFields} from '../../options';
import type {
	IsoBaseMediaBox,
	IsoBaseMediaStructure,
	ParseResult,
} from '../../parse-result';
import type {BoxAndNext, PartialMdatBox} from '../../parse-video';
import type {ParserContext} from '../../parser-context';
import {registerTrack} from '../../register-track';
import {parseEsds} from './esds/esds';
import {parseFtyp} from './ftyp';
import {makeBaseMediaTrack} from './make-track';
import {parseMdat} from './mdat/mdat';
import {parseMdhd} from './mdhd';
import {parseHdlr} from './meta/hdlr';
import {parseIlstBox} from './meta/ilst';
import {parseMoov} from './moov/moov';
import {parseMvhd} from './mvhd';
import {parseAv1C} from './stsd/av1c';
import {parseAvcc} from './stsd/avcc';
import {parseColorParameterBox} from './stsd/colr';
import {parseCtts} from './stsd/ctts';
import {parseHvcc} from './stsd/hvcc';
import {parseKeys} from './stsd/keys';
import {parseMebx} from './stsd/mebx';
import {parsePasp} from './stsd/pasp';
import {parseStco} from './stsd/stco';
import {parseStsc} from './stsd/stsc';
import {parseStsd} from './stsd/stsd';
import {parseStss} from './stsd/stss';
import {parseStsz} from './stsd/stsz';
import {parseStts} from './stsd/stts';
import {parseTfdt} from './tfdt';
import {getTfhd} from './tfhd';
import {parseTkhd} from './tkhd';
import {parseTrak} from './trak/trak';
import {getMdatBox} from './traversal';
import {parseTrun} from './trun';

const getChildren = async ({
	boxType,
	iterator,
	bytesRemainingInBox,
	options,
	signal,
	logLevel,
	fields,
}: {
	boxType: string;
	iterator: BufferIterator;
	bytesRemainingInBox: number;
	options: ParserContext;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<IsoBaseMediaBox[]> => {
	const parseChildren =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'udta' ||
		boxType === 'moof' ||
		boxType === 'dims' ||
		boxType === 'meta' ||
		boxType === 'wave' ||
		boxType === 'traf' ||
		boxType === 'stsb';

	if (parseChildren) {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const parsed = await parseIsoBaseMediaBoxes({
			iterator,
			maxBytes: bytesRemainingInBox,
			allowIncompleteBoxes: false,
			initialBoxes: [],
			options,
			continueMdat: false,
			signal,
			logLevel,
			fields,
		});

		if (parsed.status === 'incomplete') {
			throw new Error('Incomplete boxes are not allowed');
		}

		return parsed.segments.boxes;
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
	signal,
}: {
	iterator: BufferIterator;
	boxSize: number;
	fileOffset: number;
	parsedBoxes: IsoBaseMediaBox[];
	options: ParserContext;
	signal: AbortSignal | null;
}): Promise<BoxAndNext> => {
	const box = await parseMdat({
		data: iterator,
		size: boxSize,
		fileOffset,
		existingBoxes: parsedBoxes,
		options,
		signal,
		maySkipSampleProcessing: options.supportsContentRange,
	});

	if (
		(box.status === 'samples-processed' || box.status === 'samples-buffered') &&
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
	signal,
	logLevel,
	fields,
}: {
	iterator: BufferIterator;
	allowIncompleteBoxes: boolean;
	parsedBoxes: IsoBaseMediaBox[];
	options: ParserContext;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<BoxAndNext> => {
	const fileOffset = iterator.counter.getOffset();
	const bytesRemaining = iterator.bytesRemaining();

	const boxSizeRaw = iterator.getFourByteNumber();

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

	const boxSize = boxSizeRaw === 1 ? iterator.getEightByteNumber() : boxSizeRaw;

	if (bytesRemaining < boxSize) {
		if (boxType === 'mdat') {
			// Check if the moov atom is at the end
			const shouldSkip =
				options.parserState.maySkipVideoData() ||
				(!hasTracks(
					{type: 'iso-base-media', boxes: parsedBoxes},
					options.parserState,
				) &&
					options.supportsContentRange);

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
							status: 'samples-skipped',
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
					signal,
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
			size: boxSize,
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

	if (boxType === 'trun') {
		const box = parseTrun({iterator, offset: fileOffset, size: boxSize});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'tfdt') {
		const box = parseTfdt({iterator, size: boxSize, offset: fileOffset});

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
			signal,
			fields,
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
			signal,
			fields,
		});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'hdlr') {
		const box = await parseHdlr({iterator, size: boxSize, offset: fileOffset});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'keys') {
		const box = parseKeys({iterator, size: boxSize, offset: fileOffset});

		return {
			type: 'complete',
			box,
			size: boxSize,
			skipTo: null,
		};
	}

	if (boxType === 'ilst') {
		const box = parseIlstBox({
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

	if (boxType === 'moov') {
		const box = await parseMoov({
			iterator,
			offset: fileOffset,
			size: boxSize,
			options,
			signal,
			logLevel,
			fields,
		});

		options.parserState.tracks.setIsDone();

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
			signal,
			logLevel,
			fields,
		});
		const transformedTrack = makeBaseMediaTrack(box);
		if (transformedTrack) {
			await registerTrack({
				options,
				track: transformedTrack,
			});
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

	if (boxType === 'tfhd') {
		const box = getTfhd({
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
			signal,
			maySkipSampleProcessing: options.supportsContentRange,
		});

		if (box === null) {
			throw new Error('Unexpected null');
		}

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
		signal,
		logLevel,
		fields,
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

export const parseIsoBaseMediaBoxes = async ({
	iterator,
	maxBytes,
	allowIncompleteBoxes,
	initialBoxes,
	options,
	continueMdat,
	signal,
	logLevel,
	fields,
}: {
	iterator: BufferIterator;
	maxBytes: number;
	allowIncompleteBoxes: boolean;
	initialBoxes: IsoBaseMediaBox[];
	options: ParserContext;
	continueMdat: false | PartialMdatBox;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult<IsoBaseMediaStructure>> => {
	const structure: IsoBaseMediaStructure = {
		type: 'iso-base-media',
		boxes: initialBoxes,
	};
	const initialOffset = iterator.counter.getOffset();
	const alreadyHasMdat = structure.boxes.find((b) => b.type === 'mdat-box');

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
					signal,
				})
			: await processBox({
					iterator,
					allowIncompleteBoxes,
					parsedBoxes: initialBoxes,
					options,
					signal,
					logLevel,
					fields,
				});

		if (result.type === 'incomplete') {
			if (Number.isFinite(maxBytes)) {
				throw new Error('maxBytes must be Infinity for top-level boxes');
			}

			return {
				status: 'incomplete',
				segments: structure,
				continueParsing: () => {
					return parseIsoBaseMediaBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes: structure.boxes,
						options,
						continueMdat: false,
						signal,
						logLevel,
						fields,
					});
				},
				skipTo: null,
			};
		}

		if (result.type === 'partial-mdat-box') {
			return {
				status: 'incomplete',
				segments: structure,
				continueParsing: () => {
					return Promise.resolve(
						parseIsoBaseMediaBoxes({
							iterator,
							maxBytes,
							allowIncompleteBoxes,
							initialBoxes: structure.boxes,
							options,
							continueMdat: result,
							signal,
							logLevel,
							fields,
						}),
					);
				},
				skipTo: null,
			};
		}

		if (result.box.type === 'mdat-box' && alreadyHasMdat) {
			structure.boxes = structure.boxes.filter((b) => b.type !== 'mdat-box');
			structure.boxes.push(result.box);
			iterator.allowDiscard();
			if (result.box.status !== 'samples-processed') {
				throw new Error('unexpected');
			}

			break;
		} else {
			structure.boxes.push(result.box);
			if (hasAllInfo({fields, state: options.parserState, structure})) {
				return {
					status: 'done',
					segments: structure,
				};
			}
		}

		if (result.skipTo !== null) {
			if (!options.supportsContentRange) {
				throw new Error(
					'Content-Range header is not supported by the reader, but was asked to seek',
				);
			}

			return {
				status: 'incomplete',
				segments: structure,
				continueParsing: () => {
					return parseIsoBaseMediaBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes: structure.boxes,
						options,
						continueMdat: false,
						signal,
						logLevel,
						fields,
					});
				},
				skipTo: result.skipTo,
			};
		}

		if (iterator.bytesRemaining() < 0) {
			return {
				status: 'incomplete',
				segments: structure,
				continueParsing: () => {
					return parseIsoBaseMediaBoxes({
						iterator,
						maxBytes,
						allowIncompleteBoxes,
						initialBoxes: structure.boxes,
						options,
						continueMdat: false,
						signal,
						logLevel,
						fields,
					});
				},
				skipTo: null,
			};
		}

		iterator.removeBytesRead();
	}

	const mdatState = getMdatBox(structure.boxes);
	const skipped =
		mdatState?.status === 'samples-skipped' &&
		!options.parserState.maySkipVideoData() &&
		options.supportsContentRange;
	const buffered =
		mdatState?.status === 'samples-buffered' &&
		!options.parserState.maySkipVideoData();

	if (skipped || buffered) {
		return {
			status: 'incomplete',
			segments: structure,
			continueParsing: () => {
				if (buffered) {
					iterator.skipTo(mdatState.fileOffset, false);
				}

				return parseIsoBaseMediaBoxes({
					iterator,
					maxBytes,
					allowIncompleteBoxes: false,
					initialBoxes: structure.boxes,
					options,
					continueMdat: false,
					signal,
					logLevel,
					fields,
				});
			},
			skipTo: skipped ? mdatState.fileOffset : null,
		};
	}

	return {
		status: 'done',
		segments: structure,
	};
};
