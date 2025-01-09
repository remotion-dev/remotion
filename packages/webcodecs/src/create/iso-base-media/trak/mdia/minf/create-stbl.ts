import type {SamplePosition} from '@remotion/media-parser';
import {truthy} from '../../../../../truthy';
import {combineUint8Arrays} from '../../../../matroska/matroska-utils';
import {addSize, stringsToUint8Array} from '../../../primitives';
import {createCttsBox} from './stbl/create-ctts';
import {createStcoAtom} from './stbl/create-stco';
import {createStsc} from './stbl/create-stsc';
import {createStss} from './stbl/create-stss';
import {createStsz} from './stbl/create-stsz';
import {createSttsAtom} from './stbl/create-stts';
import {createStsdData} from './stbl/stsd/create-avc1';

export const createStbl = ({
	samplePositions,
	codecSpecificData,
	isVideo,
}: {
	samplePositions: SamplePosition[];
	codecSpecificData: Uint8Array;
	isVideo: boolean;
}) => {
	// For stts:
	// https://developer.apple.com/documentation/quicktime-file-format/time-to-sample_atom
	// The sample entries are ordered by time stamps; therefore, the deltas are all nonnegative.

	// For the other tables, there doesn't seem to be a requirement for them to be sorted

	// -> ordering the sample positions by dts
	const sorted = samplePositions.slice().sort((a, b) => a.dts - b.dts);

	return addSize(
		combineUint8Arrays(
			[
				stringsToUint8Array('stbl'),
				createStsdData(codecSpecificData),
				createSttsAtom(sorted),
				isVideo ? createStss(samplePositions) : null,
				createCttsBox(samplePositions),
				createStsc(samplePositions),
				createStsz(samplePositions),
				createStcoAtom(samplePositions),
				isVideo
					? null
					: new Uint8Array([
							0x00, 0x00, 0x00, 0x1a, 0x73, 0x67, 0x70, 0x64, 0x01, 0x00, 0x00,
							0x00, 0x72, 0x6f, 0x6c, 0x6c, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
							0x00, 0x01, 0xff, 0xff, 0x00, 0x00, 0x00, 0x1c, 0x73, 0x62, 0x67,
							0x70, 0x00, 0x00, 0x00, 0x00, 0x72, 0x6f, 0x6c, 0x6c, 0x00, 0x00,
							0x00, 0x01, 0x00, 0x00, 0x0a, 0x19, 0x00, 0x00, 0x00, 0x01,
						]),
			].filter(truthy),
		),
	);
};
