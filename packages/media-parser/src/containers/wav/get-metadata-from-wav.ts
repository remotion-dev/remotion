import type {MediaParserMetadataEntry} from '../../metadata/get-metadata';
import type {WavStructure} from './types';

export const getMetadataFromWav = (
	structure: WavStructure,
): MediaParserMetadataEntry[] | null => {
	const list = structure.boxes.find((b) => b.type === 'wav-list');
	if (!list) {
		return null;
	}

	return list.metadata;
};
