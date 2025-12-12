import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {MediaParserReaderInterface} from '../../readers/reader';
import type {CanSkipTracksState} from '../../state/can-skip-tracks';
import type {M3uState} from '../../state/m3u-state';
import type {MediaParserOnAudioTrack} from '../../webcodec-sample-types';
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
	selectAssociatedPlaylistsFn,
	readerInterface,
	onAudioTrack,
	canSkipTracks,
}: {
	structure: M3uStructure;
	m3uState: M3uState;
	src: string;
	selectM3uStreamFn: SelectM3uStreamFn;
	selectAssociatedPlaylistsFn: SelectM3uAssociatedPlaylistsFn;
	logLevel: MediaParserLogLevel;
	readerInterface: MediaParserReaderInterface;
	onAudioTrack: MediaParserOnAudioTrack | null;
	canSkipTracks: CanSkipTracksState;
}) => {
	const independentSegments = isIndependentSegments(structure);
	const streams = getM3uStreams({structure, originalSrc: src, readerInterface});

	// If there are no streams, this is a single media playlist (not a master playlist)
	// Treat it as the initial URL to iterate over
	if (!independentSegments || streams === null) {
		if (!src) {
			throw new Error('No src');
		}

		m3uState.setSelectedMainPlaylist({
			type: 'initial-url',
			url: src,
		});

		return m3uState.setReadyToIterateOverM3u();
	}

	const selectedPlaylist = await selectStream({streams, fn: selectM3uStreamFn});

	if (!selectedPlaylist.dimensions) {
		throw new Error('Stream does not have a resolution');
	}

	m3uState.setSelectedMainPlaylist({
		type: 'selected-stream',
		stream: selectedPlaylist,
	});

	const skipAudioTracks =
		onAudioTrack === null && canSkipTracks.doFieldsNeedTracks() === false;

	const associatedPlaylists = await selectAssociatedPlaylists({
		playlists: selectedPlaylist.associatedPlaylists,
		fn: selectAssociatedPlaylistsFn,
		skipAudioTracks,
	});
	m3uState.setAssociatedPlaylists(associatedPlaylists);

	const playlistUrls = [
		selectedPlaylist.src,
		...associatedPlaylists.map((p) => p.src),
	];
	const struc = await Promise.all(
		playlistUrls.map(async (url): Promise<M3uPlaylist> => {
			Log.verbose(logLevel, `Fetching playlist ${url}`);
			const boxes = await fetchM3u8Stream({url, readerInterface});

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
