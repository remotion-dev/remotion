import {Log} from '../../log';
import {registerTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import type {BoxAndNext} from './base-media-box';
import {parseEsds} from './esds/esds';
import {parseFtyp} from './ftyp';
import {getIsoBaseMediaChildren} from './get-children';
import {makeBaseMediaTrack} from './make-track';
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
import {parseTrun} from './trun';

export const processBox = async (state: ParserState): Promise<BoxAndNext> => {
	const {iterator} = state;
	const fileOffset = iterator.counter.getOffset();
	const {returnToCheckpoint} = iterator.startCheckpoint();
	const bytesRemaining = iterator.bytesRemaining();

	const startOff = iterator.counter.getOffset();
	const boxSizeRaw = iterator.getFourByteNumber();

	if (boxSizeRaw === 0) {
		return {
			box: {
				type: 'void-box',
				boxSize: 0,
			},
		};
	}

	// If `boxSize === 1`, the 8 bytes after the box type are the size of the box.
	if (
		(boxSizeRaw === 1 && iterator.bytesRemaining() < 12) ||
		iterator.bytesRemaining() < 4
	) {
		iterator.counter.decrement(iterator.counter.getOffset() - fileOffset);
		throw new Error(
			`Expected box size of ${bytesRemaining}, got ${boxSizeRaw}. Incomplete boxes are not allowed.`,
		);
	}

	const boxType = iterator.getByteString(4, false);
	const boxSize = boxSizeRaw === 1 ? iterator.getEightByteNumber() : boxSizeRaw;
	Log.trace(state.logLevel, 'Found box', boxType, boxSize);
	const headerLength = iterator.counter.getOffset() - startOff;

	if (boxType === 'mdat') {
		state.videoSection.setVideoSection({
			size: boxSize - headerLength,
			start: iterator.counter.getOffset(),
		});

		return {
			box: null,
		};
	}

	if (bytesRemaining < boxSize) {
		returnToCheckpoint();
		return {
			box: null,
		};
	}

	if (boxType === 'ftyp') {
		const box = parseFtyp({iterator, size: boxSize, offset: fileOffset});
		return {
			box,
		};
	}

	if (boxType === 'colr') {
		const box = parseColorParameterBox({
			iterator,
			size: boxSize,
		});
		return {
			box,
		};
	}

	if (boxType === 'mvhd') {
		const box = parseMvhd({iterator, offset: fileOffset, size: boxSize});

		return {
			box,
		};
	}

	if (boxType === 'tkhd') {
		const box = parseTkhd({iterator, offset: fileOffset, size: boxSize});

		return {
			box,
		};
	}

	if (boxType === 'trun') {
		const box = parseTrun({iterator, offset: fileOffset, size: boxSize});

		return {
			box,
		};
	}

	if (boxType === 'tfdt') {
		const box = parseTfdt({iterator, size: boxSize, offset: fileOffset});

		return {
			box,
		};
	}

	if (boxType === 'stsd') {
		const box = await parseStsd({
			offset: fileOffset,
			size: boxSize,
			state,
		});

		return {
			box,
		};
	}

	if (boxType === 'stsz') {
		const box = parseStsz({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			box,
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
			box,
		};
	}

	if (boxType === 'pasp') {
		const box = parsePasp({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'stss') {
		const box = parseStss({
			iterator,
			offset: fileOffset,
			boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'ctts') {
		const box = parseCtts({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'stsc') {
		const box = parseStsc({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'mebx') {
		const box = await parseMebx({
			offset: fileOffset,
			size: boxSize,
			state,
		});

		return {
			box,
		};
	}

	if (boxType === 'hdlr') {
		const box = await parseHdlr({iterator, size: boxSize, offset: fileOffset});

		return {
			box,
		};
	}

	if (boxType === 'keys') {
		const box = parseKeys({iterator, size: boxSize, offset: fileOffset});

		return {
			box,
		};
	}

	if (boxType === 'ilst') {
		const box = parseIlstBox({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'moov') {
		if (state.callbacks.tracks.hasAllTracks()) {
			iterator.discard(boxSize - 8);
			return {
				box: null,
			};
		}

		const box = await parseMoov({
			offset: fileOffset,
			size: boxSize,
			state,
		});

		state.callbacks.tracks.setIsDone();

		return {
			box,
		};
	}

	if (boxType === 'trak') {
		const box = await parseTrak({
			size: boxSize,
			offsetAtStart: fileOffset,
			state,
		});
		const transformedTrack = makeBaseMediaTrack(box);
		if (transformedTrack) {
			await registerTrack({
				state,
				track: transformedTrack,
				container: 'mp4',
			});
		}

		return {
			box,
		};
	}

	if (boxType === 'stts') {
		const box = parseStts({
			data: iterator,
			size: boxSize,
			fileOffset,
		});

		return {
			box,
		};
	}

	if (boxType === 'avcC') {
		const box = parseAvcc({
			data: iterator,
			size: boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'av1C') {
		const box = parseAv1C({
			data: iterator,
			size: boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'hvcC') {
		const box = parseHvcc({
			data: iterator,
			size: boxSize,
			offset: fileOffset,
		});

		return {
			box,
		};
	}

	if (boxType === 'tfhd') {
		const box = getTfhd({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});

		return {
			box,
		};
	}

	if (boxType === 'mdhd') {
		const box = parseMdhd({
			data: iterator,
			size: boxSize,
			fileOffset,
		});

		return {
			box,
		};
	}

	if (boxType === 'esds') {
		const box = parseEsds({
			data: iterator,
			size: boxSize,
			fileOffset,
		});

		return {
			box,
		};
	}

	if (
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'udta' ||
		boxType === 'moof' ||
		boxType === 'dims' ||
		boxType === 'meta' ||
		boxType === 'wave' ||
		boxType === 'traf' ||
		boxType === 'stsb'
	) {
		const children = await getIsoBaseMediaChildren({
			state,
			size: boxSize - 8,
		});

		return {
			box: {
				type: 'regular-box',
				boxType,
				boxSize,
				children,
				offset: fileOffset,
			},
		};
	}

	iterator.discard(boxSize - 8);

	return {
		box: {
			type: 'regular-box',
			boxType,
			boxSize,
			children: [],
			offset: fileOffset,
		},
	};
};
