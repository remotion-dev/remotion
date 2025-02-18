import {isIndependentSegments} from './get-streams';
import type {M3uPlaylist, M3uStructure} from './types';

export const getPlaylist = (structure: M3uStructure): M3uPlaylist => {
	const isIndependent = isIndependentSegments(structure);
	if (!isIndependent) {
		return {
			type: 'm3u-playlist',
			boxes: structure.boxes,
		};
	}

	const playlists = structure.boxes.filter(
		(box) => box.type === 'm3u-playlist',
	);
	if (playlists.length !== 1) {
		throw new Error('Expected one playlist');
	}

	return playlists[0];
};

export const getDurationFromPlaylist = (playlist: M3uPlaylist): number => {
	const duration = playlist.boxes.filter((box) => box.type === 'm3u-extinf');
	if (duration.length === 0) {
		throw new Error('Expected duration in m3u playlist');
	}

	return duration.reduce((acc, d) => acc + d.value, 0);
};
