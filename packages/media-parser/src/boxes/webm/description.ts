import {getArrayBufferIterator} from '../../buffer-iterator';
import type {TrackEntry} from './segments/all-segments';
import {getCodecSegment, getPrivateData} from './traversal';

export const getAudioDescription = (
	track: TrackEntry,
): undefined | Uint8Array => {
	const codec = getCodecSegment(track);
	if (!codec || codec.value !== 'A_VORBIS') {
		return undefined;
	}

	// how to parse vorbis private
	// https://github.com/google/ExoPlayer/blob/dd430f7053a1a3958deea3ead6a0565150c06bfc/library/extractor/src/main/java/com/google/android/exoplayer2/extractor/mkv/MatroskaExtractor.java#L2466
	const privateData = getPrivateData(track);
	if (!privateData) {
		return undefined;
	}

	if (privateData[0] !== 2) {
		throw new Error('Expected vorbis private data version 2');
	}

	let offset = 1;
	let vorbisInfoLength = 0;
	let vorbisSkipLength = 0;

	while ((privateData[offset] & 0xff) === 0xff) {
		vorbisInfoLength += 0xff;
		offset++;
	}

	vorbisInfoLength += privateData[offset++] & 0xff;

	while ((privateData[offset] & 0xff) === 0xff) {
		vorbisSkipLength += 0xff;
		offset++;
	}

	vorbisSkipLength += privateData[offset++] & 0xff;

	if (privateData[offset] !== 0x01) {
		throw new Error('Error parsing vorbis codec private');
	}

	const vorbisInfo = privateData.slice(offset, offset + vorbisInfoLength);
	offset += vorbisInfoLength;

	if (privateData[offset] !== 0x03) {
		throw new Error('Error parsing vorbis codec private');
	}

	const vorbisComments = privateData.slice(offset, offset + vorbisSkipLength);
	offset += vorbisSkipLength;

	if (privateData[offset] !== 0x05) {
		throw new Error('Error parsing vorbis codec private');
	}

	const vorbisBooks = privateData.slice(offset);

	const bufferIterator = getArrayBufferIterator(
		vorbisInfo.slice(0),
		vorbisInfo.length,
	);

	// type
	bufferIterator.getUint8();
	// vorbis
	const vorbis = bufferIterator.getByteString(6, false);
	if (vorbis !== 'vorbis') {
		throw new Error('Error parsing vorbis codec private');
	}

	const vorbisVersion = bufferIterator.getUint32Le();
	if (vorbisVersion !== 0) {
		throw new Error('Error parsing vorbis codec private');
	}

	const vorbisDescription = new Uint8Array([
		// constructing the vorbis description
		// This format consists in the page_segments field
		/**
		 * The number of segment entries to appear in the segment table.
		 * The maximum number of 255 segments (255 bytes each) sets the maximum possible physical page size at 65307 bytes or just under 64kB (thus we know that a header corrupted so as destroy sizing/alignment information will not cause a runaway bitstream.
		 * We'll read in the page according to the corrupted size information that's guaranteed to be a reasonable size regardless, notice the checksum mismatch, drop sync and then look for recapture).
		 */
		2,
		// followed by the segment_table field
		// offset of the comments table
		vorbisInfo.length,
		// offset of the codebooks table
		vorbisComments.length,
		// followed by the three Vorbis header packets,
		// respectively the identification header,
		...vorbisInfo,
		// the comments header,
		...vorbisComments,
		// and the setup header, in this order, as described in section 4.2 of [VORBIS].
		...vorbisBooks,
	]);

	return vorbisDescription;
};
