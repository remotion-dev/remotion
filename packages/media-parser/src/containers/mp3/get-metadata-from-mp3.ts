import type {MediaParserMetadataEntry} from '../../metadata/get-metadata';
import type {Mp3Structure} from '../../parse-result';

export const getMetadataFromMp3 = (
	mp3Structure: Mp3Structure,
): MediaParserMetadataEntry[] => {
	const findHeader = mp3Structure.boxes.find((b) => b.type === 'id3-header');
	// Not all MP3s file have this header.
	// Internal link: https://discord.com/channels/809501355504959528/1001500302375125055/1408880907602890752
	return findHeader ? findHeader.metatags : [];
};
