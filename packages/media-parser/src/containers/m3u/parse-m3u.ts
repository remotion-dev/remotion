import type {ParserState} from '../../state/parser-state';
import {afterManifestFetch} from './after-manifest-fetch';
import {parseM3uManifest} from './parse-m3u-manifest';
import {runOverM3u} from './run-over-m3u';

export const parseM3u = async ({state}: {state: ParserState}) => {
	const structure = state.getM3uStructure();
	if (state.m3u.isReadyToIterateOverM3u()) {
		const selectedPlaylists = state.m3u.getSelectedPlaylists();

		// TODO: Should not run over all same playlists at once

		for (const playlist of selectedPlaylists) {
			await runOverM3u({
				state,
				structure,
				playlistUrl: playlist,
				logLevel: state.logLevel,
			});
		}

		return null;
	}

	if (state.m3u.hasFinishedManifest()) {
		await afterManifestFetch({
			structure,
			m3uState: state.m3u,
			src: typeof state.src === 'string' ? state.src : null,
			selectM3uStreamFn: state.selectM3uStreamFn,
			logLevel: state.logLevel,
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
