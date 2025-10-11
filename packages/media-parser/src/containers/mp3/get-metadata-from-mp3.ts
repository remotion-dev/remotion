import type {MediaParserMetadataEntry} from '../../metadata/get-metadata';
import type {Mp3Structure} from '../../parse-result';

export const getMetadataFromMp3 = (
	mp3Structure: Mp3Structure,
): MediaParserMetadataEntry[] | null => {
	const findHeader = mp3Structure.boxes.find((b) => b.type === 'id3-header');
	return findHeader ? findHeader.metatags : null;
};
