import type {M3uPlaylist, M3uStructure} from './types';

export const getPlaylist = (structure: M3uStructure) => {
	const playlists = structure.boxes.filter(
		(box) => box.type === 'm3u-playlist',
	);
	if (playlists.length !== 1) {
		throw new Error('Expected one playlist');
	}

	return playlists[0];
};

export const getDurationFromPlaylist = (playlist: M3uPlaylist): number => {
	const duration = playlist.boxes.find(
		(box) => box.type === 'm3u-target-duration',
	);
	if (!duration) {
		throw new Error('Expected duration in m3u playlist');
	}

	return duration.duration;
};
