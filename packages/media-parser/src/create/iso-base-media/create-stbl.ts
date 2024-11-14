import {combineUint8Arrays} from '../../boxes/webm/make-header';
import type {SamplePosition} from '../../get-sample-positions';
import {createCttsBox} from './mdia/stbl/create-ctts';
import {createStcoAtom} from './mdia/stbl/create-stco';
import {createStsc} from './mdia/stbl/create-stsc';
import {createStss} from './mdia/stbl/create-stss';
import {createStsz} from './mdia/stbl/create-stsz';
import {createSttsAtom} from './mdia/stbl/create-stts';
import type {Avc1Data} from './mdia/stbl/stsd/create-avc1';
import {createStsdData} from './mdia/stbl/stsd/create-avc1';
import {addSize, stringsToUint8Array} from './primitives';

export const createStbl = ({
	samplePositions,
	avc1Data,
}: {
	samplePositions: SamplePosition[];
	avc1Data: Avc1Data;
}) => {
	return addSize(
		combineUint8Arrays([
			stringsToUint8Array('stbl'),
			createStsdData(avc1Data),
			createSttsAtom(samplePositions),
			createStss(samplePositions),
			createCttsBox(samplePositions),
			createStsc(samplePositions),
			createStsz(samplePositions),
			createStcoAtom(samplePositions),
		]),
	);
};
