import {combineUint8Arrays} from '../../boxes/webm/make-header';
import type {SamplePosition} from '../../get-sample-positions';
import {addSize, stringsToUint8Array} from './primitives';
import {createCttsBox} from './stbl/create-ctts';
import {createStcoAtom} from './stbl/create-stco';
import {createStsc} from './stbl/create-stsc';
import {createStss} from './stbl/create-stss';
import {createStsz} from './stbl/create-stsz';
import {createSttsAtom} from './stbl/create-stts';
import type {Avc1Data} from './stbl/stsd/create-avc1';
import {createStsdData} from './stbl/stsd/create-avc1';

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
