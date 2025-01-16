import type {BufferIterator} from '../../buffer-iterator';
import {getHasTracks} from '../../get-tracks';
import {Log} from '../../log';
import {maySkipVideoData} from '../../may-skip-video-data/may-skip-video-data';
import type {IsoBaseMediaStructure} from '../../parse-result';
import type {BoxAndNext} from '../../parse-video';
import {registerTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
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

export const processBox = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<BoxAndNext> => {
	const fileOffset = iterator.counter.getOffset();
	const bytesRemaining = iterator.bytesRemaining();

	const boxSizeRaw = iterator.getFourByteNumber();

	if (boxSizeRaw === 0) {
		return {
			box: {
				type: 'void-box',
				boxSize: 0,
			},
			skipTo: null,
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
	Log.trace(state.logLevel, 'Found box', boxType);
	const boxSize = boxSizeRaw === 1 ? iterator.getEightByteNumber() : boxSizeRaw;

	if (boxType === 'mdat') {
		state.videoSection.setVideoSection({
			size: boxSize - 8,
			start: iterator.counter.getOffset(),
		});

		// TODO: if content range is not supported we fall apart
		const shouldSkip =
			maySkipVideoData({state}) ||
			(!getHasTracks(
				state.structure.getStructure() as IsoBaseMediaStructure,
				state,
			) &&
				state.supportsContentRange);

		if (shouldSkip) {
			state.iso.setShouldReturnToVideoSectionAfterEnd(true);
			return {
				skipTo: fileOffset + boxSize,
				box: null,
			};
		}

		return {
			box: null,
			skipTo: null,
		};
	}

	if (bytesRemaining < boxSize) {
		throw new Error(
			`Expected box size of ${bytesRemaining}, got ${boxSize} for ${boxType}. Incomplete boxes are not allowed.`,
		);
	}

	if (boxType === 'ftyp') {
		const box = parseFtyp({iterator, size: boxSize, offset: fileOffset});
		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'colr') {
		const box = parseColorParameterBox({
			iterator,
			size: boxSize,
		});
		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'mvhd') {
		const box = parseMvhd({iterator, offset: fileOffset, size: boxSize});

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'tkhd') {
		const box = parseTkhd({iterator, offset: fileOffset, size: boxSize});

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'trun') {
		const box = parseTrun({iterator, offset: fileOffset, size: boxSize});

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'tfdt') {
		const box = parseTfdt({iterator, size: boxSize, offset: fileOffset});

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'stsd') {
		const box = await parseStsd({
			iterator,
			offset: fileOffset,
			size: boxSize,
			state,
		});

		return {
			box,
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
			box,
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
			box,
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
			box,
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
			box,
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
			box,
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
			box,
			skipTo: null,
		};
	}

	if (boxType === 'mebx') {
		const box = await parseMebx({
			iterator,
			offset: fileOffset,
			size: boxSize,
			state,
		});

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'hdlr') {
		const box = await parseHdlr({iterator, size: boxSize, offset: fileOffset});

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'keys') {
		const box = parseKeys({iterator, size: boxSize, offset: fileOffset});

		return {
			box,
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
			box,
			skipTo: null,
		};
	}

	if (boxType === 'moov') {
		if (state.callbacks.tracks.hasAllTracks()) {
			iterator.discard(boxSize - 8);
			return {
				box: null,
				skipTo: null,
			};
		}

		const box = await parseMoov({
			iterator,
			offset: fileOffset,
			size: boxSize,
			state,
		});

		state.callbacks.tracks.setIsDone();

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'trak') {
		const box = await parseTrak({
			data: iterator,
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
			box,
			skipTo: null,
		};
	}

	if (boxType === 'avcC') {
		const box = parseAvcc({
			data: iterator,
			size: boxSize,
		});

		return {
			box,
			skipTo: null,
		};
	}

	if (boxType === 'av1C') {
		const box = parseAv1C({
			data: iterator,
			size: boxSize,
		});

		return {
			box,
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
			box,
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
			box,
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
			box,
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
			box,
			skipTo: null,
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
			iterator,
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
			skipTo: null,
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
		skipTo: null,
	};
};
