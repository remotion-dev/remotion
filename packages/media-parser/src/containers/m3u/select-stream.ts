import type {M3uAssociatedPlaylist, M3uStream} from './get-streams';

export type SelectM3uStreamFnOptions = {
	streams: M3uStream[];
};

export type SelectM3uStreamFn = (
	options: SelectM3uStreamFnOptions,
) => number | Promise<number>;

export type SelectM3uAssociatedPlaylistsFnOptions = {
	associatedPlaylists: M3uAssociatedPlaylist[];
};

export type SelectM3uAssociatedPlaylistsFn = (
	options: SelectM3uAssociatedPlaylistsFnOptions,
) => M3uAssociatedPlaylist[] | Promise<M3uAssociatedPlaylist[]>;

export const selectAssociatedPlaylists = async ({
	playlists,
	fn,
	skipAudioTracks,
}: {
	playlists: M3uAssociatedPlaylist[];
	fn: SelectM3uAssociatedPlaylistsFn;
	skipAudioTracks: boolean;
}): Promise<M3uAssociatedPlaylist[]> => {
	if (playlists.length < 1) {
		return Promise.resolve([]);
	}

	const streams = await fn({associatedPlaylists: playlists});
	if (!Array.isArray(streams)) {
		throw new Error('Expected an array of associated playlists');
	}

	const selectedStreams: M3uAssociatedPlaylist[] = [];
	for (const stream of streams) {
		if (stream.isAudio && skipAudioTracks) {
			continue;
		}

		if (!playlists.find((playlist) => playlist.src === stream.src)) {
			throw new Error(
				`The associated playlist ${JSON.stringify(streams)} cannot be selected because it was not in the list of selectable playlists`,
			);
		}

		selectedStreams.push(stream);
	}

	return selectedStreams;
};

export const defaultSelectM3uAssociatedPlaylists: SelectM3uAssociatedPlaylistsFn =
	({associatedPlaylists}) => {
		if (associatedPlaylists.length === 1) {
			return associatedPlaylists;
		}

		return associatedPlaylists.filter((playlist) => playlist.default);
	};

export const selectStream = async ({
	streams,
	fn,
}: {
	streams: M3uStream[];
	fn: SelectM3uStreamFn;
}): Promise<M3uStream> => {
	if (streams.length < 1) {
		throw new Error('No streams found');
	}

	const selectedStreamId = await fn({streams});
	const selectedStream = streams.find(
		(stream) => stream.id === selectedStreamId,
	);

	if (!selectedStream) {
		throw new Error(`No stream with the id ${selectedStreamId} found`);
	}

	return Promise.resolve(selectedStream);
};

export const defaultSelectM3uStreamFn: SelectM3uStreamFn = ({streams}) => {
	return Promise.resolve(streams[0].id);
};
