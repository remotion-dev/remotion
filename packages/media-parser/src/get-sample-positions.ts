import type {StcoBox} from './boxes/iso-base-media/stsd/stco';
import type {StscBox} from './boxes/iso-base-media/stsd/stsc';
import type {StszBox} from './boxes/iso-base-media/stsd/stsz';

export const getSamplePositions = ({
	stcoBox,
	stszBox,
	stscBox,
}: {
	stcoBox: StcoBox;
	stszBox: StszBox;
	stscBox: StscBox;
}) => {};
