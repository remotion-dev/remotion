import {combineUint8Arrays} from '../../../../../boxes/webm/make-header';
import type {SamplePosition} from '../../../../../get-sample-positions';
import {truthy} from '../../../../../truthy';
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
	return addSize(
		combineUint8Arrays(
			[
				stringsToUint8Array('stbl'),
				createStsdData(codecSpecificData),
				createSttsAtom(samplePositions),
				isVideo ? createStss(samplePositions) : null,
				createCttsBox(samplePositions),
				createStsc(samplePositions),
				createStsz(samplePositions),
				createStcoAtom(samplePositions),
			].filter(truthy),
		),
	);
};
