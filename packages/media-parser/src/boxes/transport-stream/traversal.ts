import type {TransportStreamStructure} from '../../parse-result';
import type {TransportStreamPATBox} from './boxes';
import type {TransportStreamProgramAssociationTableEntry} from './parse-pat';
import type {TransportStreamEntry} from './parse-pmt';

const findProgramAssociationTableOrThrow = (
	structure: TransportStreamStructure,
) => {
	const box = structure.boxes.find(
		(b) => b.type === 'transport-stream-pat-box',
	);

	if (!box) {
		throw new Error('No PAT box found');
	}

	return box as TransportStreamPATBox;
};

export const findProgramMapTableOrThrow = (
	structure: TransportStreamStructure,
) => {
	const box = structure.boxes.find(
		(b) => b.type === 'transport-stream-pmt-box',
	);

	if (!box) {
		throw new Error('No PMT box found');
	}

	return box;
};

export const getProgramForId = (
	structure: TransportStreamStructure,
	packetIdentifier: number,
): TransportStreamProgramAssociationTableEntry | null => {
	const box = findProgramAssociationTableOrThrow(structure);
	const entry = box.pat.find(
		(e) => e.programMapIdentifier === packetIdentifier,
	);
	return entry ?? null;
};

export const getStreamForId = (
	structure: TransportStreamStructure,
	packetIdentifier: number,
): TransportStreamEntry | null => {
	const box = findProgramMapTableOrThrow(structure);
	const entry = box.streams.find((e) => e.pid === packetIdentifier);
	return entry ?? null;
};
