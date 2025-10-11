import type {ParserState} from '../../state/parser-state';
import {afterManifestFetch} from './after-manifest-fetch';
import {parseM3uManifest} from './parse-m3u-manifest';
import {runOverM3u} from './run-over-m3u';

export const parseM3u = async ({state}: {state: ParserState}) => {
	const structure = state.structure.getM3uStructure();
	if (state.m3u.isReadyToIterateOverM3u()) {
		const selectedPlaylists = state.m3u.getSelectedPlaylists();

		const whichPlaylistToRunOver =
			state.m3u.sampleSorter.getNextStreamToRun(selectedPlaylists);

		await runOverM3u({
			state,
			structure,
			playlistUrl: whichPlaylistToRunOver,
			logLevel: state.logLevel,
		});

		return null;
	}

	if (state.m3u.hasFinishedManifest()) {
		if (typeof state.src !== 'string' && !(state.src instanceof URL)) {
			throw new Error('Expected src to be a string');
		}

		state.mediaSection.addMediaSection({
			start: 0,
			// We do a pseudo-seek when seeking m3u, which will be the same byte
			// as we are currently in, which in most cases is the end of the file.
			size: state.contentLength + 1,
		});

		await afterManifestFetch({
			structure,
			m3uState: state.m3u,
			src: state.src.toString(),
			selectM3uStreamFn: state.selectM3uStreamFn,
			logLevel: state.logLevel,
			selectAssociatedPlaylistsFn: state.selectM3uAssociatedPlaylistsFn,
			readerInterface: state.readerInterface,
			onAudioTrack: state.onAudioTrack,
			canSkipTracks: state.callbacks.canSkipTracksState,
		});
		return null;
	}

	const box = await parseM3uManifest({
		iterator: state.iterator,
		structure,
		contentLength: state.contentLength,
	});
	const isDoneNow = state.iterator.counter.getOffset() === state.contentLength;
	if (isDoneNow) {
		state.m3u.setHasFinishedManifest();
	}

	return box;
};
