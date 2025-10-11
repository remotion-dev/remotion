import {getMetadataFromFlac} from '../containers/flac/get-metadata-from-flac';
import {getMetadataFromMp3} from '../containers/mp3/get-metadata-from-mp3';
import {getMetadataFromWav} from '../containers/wav/get-metadata-from-wav';
import type {MediaParserStructureUnstable} from '../parse-result';
import type {ParserState} from '../state/parser-state';
import {getMetadataFromIsoBase} from './metadata-from-iso';
import {getMetadataFromMatroska} from './metadata-from-matroska';
import {getMetadataFromRiff} from './metadata-from-riff';

export type MediaParserMetadataEntry = {
	key: string;
	value: string | number;
	trackId: number | null;
};

export const getMetadata = (state: ParserState): MediaParserMetadataEntry[] => {
	const structure = state.structure.getStructure();
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

		// Not all MP3s file have this header.
		// Internal link: https://discord.com/channels/809501355504959528/1001500302375125055/1408880907602890752
		return tags ?? [];
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

// TODO: This forces some containers to check the whole file
// we can do this better! skip over video data
export const hasMetadata = (
	structure: MediaParserStructureUnstable,
): boolean => {
	if (structure.type === 'mp3') {
		return getMetadataFromMp3(structure) !== null;
	}

	if (structure.type === 'wav') {
		return getMetadataFromWav(structure) !== null;
	}

	// M3U, Transport Stream, AAC cannot store any metadata

	if (
		structure.type === 'm3u' ||
		structure.type === 'transport-stream' ||
		structure.type === 'aac'
	) {
		return true;
	}

	if (structure.type === 'flac') {
		return getMetadataFromFlac(structure) !== null;
	}

	// The following containers (MP4, Matroska, AVI) all have mechanisms
	// to skip over video sections, and tests for it in read-metadata.test.ts
	if (structure.type === 'iso-base-media') {
		return false;
	}

	if (structure.type === 'matroska') {
		return false;
	}

	if (structure.type === 'riff') {
		return false;
	}

	throw new Error('Unknown container ' + (structure as never));
};
