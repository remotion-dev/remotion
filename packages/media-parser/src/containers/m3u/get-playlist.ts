import type {ParseMediaSrc} from '../../options';
import {isIndependentSegments} from './get-streams';
import type {M3uPlaylist, M3uStructure} from './types';

export const getAllPlaylists = ({
	structure,
	src,
}: {
	structure: M3uStructure;
	src: ParseMediaSrc;
}): M3uPlaylist[] => {
	const isIndependent = isIndependentSegments(structure);
	if (!isIndependent) {
		return [
			{
				type: 'm3u-playlist',
				boxes: structure.boxes,
				src,
			},
		];
	}

	const playlists = structure.boxes.filter(
		(box) => box.type === 'm3u-playlist',
	);

	return playlists;
};

export const getPlaylist = (
	structure: M3uStructure,
	src: string,
): M3uPlaylist => {
	const allPlaylists = getAllPlaylists({structure, src});

	const playlists = allPlaylists.find((box) => box.src === src);
	if (!playlists) {
		throw new Error(`Expected m3u-playlist with src ${src}`);
	}

	return playlists as M3uPlaylist;
};

export const getDurationFromPlaylist = (playlist: M3uPlaylist): number => {
	const duration = playlist.boxes.filter((box) => box.type === 'm3u-extinf');
	if (duration.length === 0) {
		throw new Error('Expected duration in m3u playlist');
	}

	return duration.reduce((acc, d) => acc + d.value, 0);
};
