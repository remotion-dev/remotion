import {Log} from '../../log';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
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
			type: 'void-box',
			boxSize: 0,
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

		return null;
	}

	if (bytesRemaining < boxSize) {
		returnToCheckpoint();
		return null;
	}

	if (boxType === 'ftyp') {
		return parseFtyp({iterator, size: boxSize, offset: fileOffset});
	}

	if (boxType === 'colr') {
		return parseColorParameterBox({
			iterator,
			size: boxSize,
		});
	}

	if (boxType === 'mvhd') {
		return parseMvhd({iterator, offset: fileOffset, size: boxSize});
	}

	if (boxType === 'tkhd') {
		return parseTkhd({iterator, offset: fileOffset, size: boxSize});
	}

	if (boxType === 'trun') {
		return parseTrun({iterator, offset: fileOffset, size: boxSize});
	}

	if (boxType === 'tfdt') {
		return parseTfdt({iterator, size: boxSize, offset: fileOffset});
	}

	if (boxType === 'stsd') {
		return parseStsd({
			offset: fileOffset,
			size: boxSize,
			state,
		});
	}

	if (boxType === 'stsz') {
		return parseStsz({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});
	}

	if (boxType === 'stco' || boxType === 'co64') {
		return parseStco({
			iterator,
			offset: fileOffset,
			size: boxSize,
			mode64Bit: boxType === 'co64',
		});
	}

	if (boxType === 'pasp') {
		return parsePasp({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});
	}

	if (boxType === 'stss') {
		return parseStss({
			iterator,
			offset: fileOffset,
			boxSize,
		});
	}

	if (boxType === 'ctts') {
		return parseCtts({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});
	}

	if (boxType === 'stsc') {
		return parseStsc({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});
	}

	if (boxType === 'mebx') {
		return parseMebx({
			offset: fileOffset,
			size: boxSize,
			state,
		});
	}

	if (boxType === 'hdlr') {
		return parseHdlr({iterator, size: boxSize, offset: fileOffset});
	}

	if (boxType === 'keys') {
		return parseKeys({iterator, size: boxSize, offset: fileOffset});
	}

	if (boxType === 'ilst') {
		return parseIlstBox({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});
	}

	if (boxType === 'moov') {
		if (state.callbacks.tracks.hasAllTracks()) {
			iterator.discard(boxSize - 8);
			return null;
		}

		if (state.iso.moov.getMoovBox()) {
			Log.verbose(state.logLevel, 'Moov box already parsed, skipping');
			iterator.discard(boxSize - 8);
			return null;
		}

		const box = await parseMoov({
			offset: fileOffset,
			size: boxSize,
			state,
		});

		state.callbacks.tracks.setIsDone(state.logLevel);

		return box;
	}

	if (boxType === 'trak') {
		const box = await parseTrak({
			size: boxSize,
			offsetAtStart: fileOffset,
			state,
		});
		const transformedTrack = makeBaseMediaTrack(box);
		if (transformedTrack && transformedTrack.type === 'video') {
			await registerVideoTrack({
				state,
				track: transformedTrack,
				container: 'mp4',
			});
		}

		if (transformedTrack && transformedTrack.type === 'audio') {
			await registerAudioTrack({
				state,
				track: transformedTrack,
				container: 'mp4',
			});
		}

		return box;
	}

	if (boxType === 'stts') {
		return parseStts({
			data: iterator,
			size: boxSize,
			fileOffset,
		});
	}

	if (boxType === 'avcC') {
		return parseAvcc({
			data: iterator,
			size: boxSize,
		});
	}

	if (boxType === 'av1C') {
		return parseAv1C({
			data: iterator,
			size: boxSize,
		});
	}

	if (boxType === 'hvcC') {
		return parseHvcc({
			data: iterator,
			size: boxSize,
			offset: fileOffset,
		});
	}

	if (boxType === 'tfhd') {
		return getTfhd({
			iterator,
			offset: fileOffset,
			size: boxSize,
		});
	}

	if (boxType === 'mdhd') {
		return parseMdhd({
			data: iterator,
			size: boxSize,
			fileOffset,
		});
	}

	if (boxType === 'esds') {
		return parseEsds({
			data: iterator,
			size: boxSize,
			fileOffset,
		});
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
			type: 'regular-box',
			boxType,
			boxSize,
			children,
			offset: fileOffset,
		};
	}

	iterator.discard(boxSize - 8);

	return {
		type: 'regular-box',
		boxType,
		boxSize,
		children: [],
		offset: fileOffset,
	};
};
