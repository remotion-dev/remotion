import {getDurationFromPlaylist, getPlaylist} from './get-playlist';
import type {M3uStructure} from './types';

export const getDurationFromM3u = (structure: M3uStructure): number | null => {
	const playlist = getPlaylist(structure);

	return getDurationFromPlaylist(playlist);
};
