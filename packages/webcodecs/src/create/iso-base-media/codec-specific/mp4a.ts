import {combineUint8Arrays} from '../../matroska/matroska-utils';
import {
	addLeading128Size,
	addSize,
	numberTo16BitUIntOrInt,
	numberTo32BitUIntOrInt,
	setFixedPointSignedOrUnsigned1616Number,
	stringsToUint8Array,
} from '../primitives';
import type {Mp4aData} from './create-codec-specific-data';

export const createMp4a = ({
	sampleRate,
	channelCount,
	avgBitrate,
	maxBitrate,
	codecPrivate,
}: Mp4aData) => {
	if (!codecPrivate) {
		throw new Error('Need codecPrivate for mp4a');
	}

	const esdsAtom = addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('esds'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// tag = 'ES_DescrTag'
			new Uint8Array([3]),
			addLeading128Size(
				combineUint8Arrays([
					// ES_ID
					numberTo16BitUIntOrInt(2),
					// streamDependenceFlag, URL_Flag, OCRstreamFlag
					new Uint8Array([0]),
					// DecoderConfigDescrTag
					new Uint8Array([4]),
					addLeading128Size(
						combineUint8Arrays([
							// objectTypeIndication
							new Uint8Array([0x40]),
							// streamType, upStream
							new Uint8Array([21]),
							// reserved
							new Uint8Array([0, 0, 0]),
							// maxBitrate
							numberTo32BitUIntOrInt(maxBitrate),
							// avgBitrate
							numberTo32BitUIntOrInt(avgBitrate),
							// DecoderSpecificInfoTag
							new Uint8Array([5]),
							// see create-aac-codecprivate.ts
							addLeading128Size(codecPrivate),
						]),
					),
					// SLConfigDescrTag
					new Uint8Array([6]),
					addLeading128Size(new Uint8Array([2])),
				]),
			),
		]),
	);

	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('mp4a'),
			// reserved
			new Uint8Array([0, 0, 0, 0, 0, 0]),
			// data_reference_index
			numberTo16BitUIntOrInt(1),
			// version
			numberTo16BitUIntOrInt(0),
			// revision level
			numberTo16BitUIntOrInt(0),
			// vendor
			new Uint8Array([0, 0, 0, 0]),
			// channelCount
			numberTo16BitUIntOrInt(channelCount),
			// sampleSize
			numberTo16BitUIntOrInt(16),
			// compressionId
			numberTo16BitUIntOrInt(0),
			// packet size
			numberTo16BitUIntOrInt(0),
			// sample rate
			setFixedPointSignedOrUnsigned1616Number(sampleRate),
			// esds atom
			esdsAtom,
		]),
	);
};
