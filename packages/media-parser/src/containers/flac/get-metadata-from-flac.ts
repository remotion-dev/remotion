import type {FlacStructure} from './types';

export const getMetadataFromFlac = (structure: FlacStructure) => {
	const box = structure.boxes.find((b) => b.type === 'flac-vorbis-comment');
	if (!box) {
		return null;
	}

	return box.fields;
};
