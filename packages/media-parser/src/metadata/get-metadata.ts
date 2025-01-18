import {getMetadataFromMp3} from '../boxes/mp3/get-metadata-from-mp3';
import {getMetadataFromWav} from '../boxes/wav/get-metadata-from-wav';
import type {Structure} from '../parse-result';
import {getMetadataFromIsoBase} from './metadata-from-iso';
import {getMetadataFromMatroska} from './metadata-from-matroska';
import {getMetadataFromRiff} from './metadata-from-riff';

export type MetadataEntry = {
	key: string;
	value: string | number;
	trackId: number | null;
};

export const getMetadata = (structure: Structure): MetadataEntry[] => {
	if (structure.type === 'matroska') {
		return getMetadataFromMatroska(structure);
	}

	if (structure.type === 'riff') {
		return getMetadataFromRiff(structure);
	}

	if (structure.type === 'transport-stream') {
		return [];
	}

	if (structure.type === 'mp3') {
		const tags = getMetadataFromMp3(structure);
		if (tags === null) {
			throw new Error('Failed to get metadata from mp3');
		}

		return tags;
	}

	if (structure.type === 'wav') {
		return getMetadataFromWav(structure) ?? [];
	}

	if (structure.type === 'aac') {
		return [];
	}

	return getMetadataFromIsoBase(structure);
};

export const hasMetadata = (structure: Structure): boolean => {
	if (structure.type === 'mp3') {
		return getMetadataFromMp3(structure) !== null;
	}

	if (structure.type === 'wav') {
		return getMetadataFromWav(structure) !== null;
	}

	return false;
};
