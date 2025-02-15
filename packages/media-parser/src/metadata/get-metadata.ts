import {getMetadataFromFlac} from '../containers/flac/get-metadata-from-flac';
import {getMetadataFromMp3} from '../containers/mp3/get-metadata-from-mp3';
import {getMetadataFromWav} from '../containers/wav/get-metadata-from-wav';
import type {Structure} from '../parse-result';
import type {ParserState} from '../state/parser-state';
import {getMetadataFromIsoBase} from './metadata-from-iso';
import {getMetadataFromMatroska} from './metadata-from-matroska';
import {getMetadataFromRiff} from './metadata-from-riff';

export type MetadataEntry = {
	key: string;
	value: string | number;
	trackId: number | null;
};

export const getMetadata = (state: ParserState): MetadataEntry[] => {
	const structure = state.getStructure();
	if (structure.type === 'matroska') {
		return getMetadataFromMatroska(structure);
	}

	if (structure.type === 'riff') {
		return getMetadataFromRiff(structure);
	}

	if (structure.type === 'transport-stream' || structure.type === 'm3u') {
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

	if (structure.type === 'flac') {
		return getMetadataFromFlac(structure) ?? [];
	}

	if (structure.type === 'iso-base-media') {
		return getMetadataFromIsoBase(state);
	}

	throw new Error('Unknown container ' + (structure as never));
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
