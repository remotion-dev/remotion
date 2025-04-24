import type {M3u8SeekingHints} from '../../seeking-hints';
import type {StructureState} from '../../state/structure';
import type {M3uPlaylist} from './types';

export const getSeekingHintsForM3u = ({
	structureState,
}: {
	structureState: StructureState;
}): M3u8SeekingHints => {
	const struct = structureState.getM3uStructure();
	const playlists = struct.boxes.filter(
		(b) => b.type === 'm3u-playlist',
	) as M3uPlaylist[];
	console.log(
		playlists.map((b) => b.boxes.filter((b) => b.type === 'm3u-extinf')),
	);

	return {
		type: 'm3u8-seeking-hints',
	};
};
