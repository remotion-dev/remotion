import type {ParserState} from '../../state/parser-state';
import {afterManifestFetch, runOverM3u} from './after-manifest-fetch';
import {parseM3uManifest} from './parse-m3u-manifest';

export const parseM3u = async ({state}: {state: ParserState}) => {
	const structure = state.getM3uStructure();
	if (state.m3u.isReadyToIterateOverM3u()) {
		const selectedStream = state.m3u.getSelectedStream();
		if (!selectedStream) {
			throw new Error('No stream selected');
		}

		const playlistUrl =
			selectedStream.type === 'initial-url'
				? selectedStream.url
				: selectedStream.stream.url;

		await runOverM3u({
			state,
			structure,
			playlistUrl,
			logLevel: state.logLevel,
		});
		return null;
	}

	if (state.m3u.hasFinishedManifest()) {
		await afterManifestFetch({
			structure,
			m3uState: state.m3u,
			src: typeof state.src === 'string' ? state.src : null,
			selectM3uStreamFn: state.selectM3uStreamFn,
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
