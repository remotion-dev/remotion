import type {ParserState} from '../../state/parser-state';
import {getAllPlaylists, getDurationFromPlaylist} from './get-playlist';

export const getDurationFromM3u = (state: ParserState): number | null => {
	const playlists = getAllPlaylists({
		structure: state.getM3uStructure(),
		src: state.src,
	});

	return Math.max(
		...playlists.map((p) => {
			return getDurationFromPlaylist(p);
		}),
	);
};
