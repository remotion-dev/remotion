import type {Structure} from '../parse-result';
import {getMetadataFromIsoBase} from './metadata-from-iso';
import {getMetadataFromRiff} from './metadata-from-riff';

export type MetadataEntry = {
	key: string;
	value: string | number;
	trackId: number | null;
};

export const getMetadata = (structure: Structure): MetadataEntry[] => {
	if (structure.type === 'matroska') {
		return [];
	}

	if (structure.type === 'riff') {
		return getMetadataFromRiff(structure);
	}

	return getMetadataFromIsoBase(structure);
};
