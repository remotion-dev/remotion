import type {ParserState} from '../../state/parser-state';
import {afterManifestFetch, runOverM3u} from './after-manifest-fetch';
import {parseM3uManifest} from './parse-m3u-manifest';

export const parseM3u = async ({state}: {state: ParserState}) => {
	const structure = state.getM3uStructure();
	if (state.m3u.isReadyToIterateOverM3u()) {
		await runOverM3u({
			state,
			structure,
		});
		return null;
	}

	if (state.m3u.hasFinishedManifest()) {
		await afterManifestFetch({
			structure,
			m3uState: state.m3u,
			src: typeof state.src === 'string' ? state.src : null,
			streamSelectionFn: state.streamSelectionFn,
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
