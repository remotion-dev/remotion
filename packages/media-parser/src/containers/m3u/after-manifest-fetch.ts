import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {M3uState} from '../../state/m3u-state';
import {fetchM3u8Stream} from './fetch-m3u8-stream';
import {getM3uStreams, isIndependentSegments} from './get-streams';
import type {
	SelectM3uAssociatedPlaylistsFn,
	SelectM3uStreamFn,
} from './select-stream';
import {selectAssociatedPlaylists, selectStream} from './select-stream';
import type {M3uPlaylist, M3uStructure} from './types';

export const afterManifestFetch = async ({
	structure,
	m3uState,
	src,
	selectM3uStreamFn,
	logLevel,
	selectAssociatedPlaylists: selectAssociatedPlaylistsFn,
}: {
	structure: M3uStructure;
	m3uState: M3uState;
	src: string | null;
	selectM3uStreamFn: SelectM3uStreamFn;
	selectAssociatedPlaylists: SelectM3uAssociatedPlaylistsFn;
	logLevel: LogLevel;
}) => {
	const independentSegments = isIndependentSegments(structure);
	if (!independentSegments) {
		if (!src) {
			throw new Error('No src');
		}

		m3uState.setSelectedMainPlaylist({
			type: 'initial-url',
			url: src,
		});

		return m3uState.setReadyToIterateOverM3u();
	}

	const streams = getM3uStreams(structure, src);
	if (streams === null) {
		throw new Error('No streams found');
	}

	const selectedPlaylist = await selectStream({streams, fn: selectM3uStreamFn});

	if (!selectedPlaylist.resolution) {
		throw new Error('Stream does not have a resolution');
	}

	m3uState.setSelectedMainPlaylist({
		type: 'selected-stream',
		stream: selectedPlaylist,
	});

	const associatedPlaylists = await selectAssociatedPlaylists({
		playlists: selectedPlaylist.associatedPlaylists,
		fn: selectAssociatedPlaylistsFn,
	});
	m3uState.setAssociatedPlaylists(associatedPlaylists);

	const playlistUrls = [
		selectedPlaylist.url,
		...associatedPlaylists.map((p) => p.url),
	];
	const struc = await Promise.all(
		playlistUrls.map(async (url): Promise<M3uPlaylist> => {
			Log.verbose(logLevel, `Fetching playlist ${url}`);
			const boxes = await fetchM3u8Stream(url);

			return {
				type: 'm3u-playlist',
				boxes,
				src: url,
			};
		}),
	);

	structure.boxes.push(...struc);

	m3uState.setReadyToIterateOverM3u();
};
