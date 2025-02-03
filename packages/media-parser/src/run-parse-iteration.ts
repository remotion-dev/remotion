import {parseAac} from './containers/aac/parse-aac';
import {parseFlac} from './containers/flac/parse-flac';
import {parseIsoBaseMedia} from './containers/iso-base-media/parse-boxes';
import {fetchM3u8Stream} from './containers/m3u/fetch-m3u8-stream';
import {getStreams} from './containers/m3u/get-streams';
import {parseM3u} from './containers/m3u/parse-m3u';
import {parseMp3} from './containers/mp3/parse-mp3';
import {parseRiff} from './containers/riff/parse-riff';
import {parseTransportStream} from './containers/transport-stream/parse-transport-stream';
import {parseWav} from './containers/wav/parse-wav';
import {parseWebm} from './containers/webm/parse-webm-header';
import {initVideo} from './init-video';
import type {ParseResult} from './parse-result';
import type {ParserState} from './state/parser-state';

export const runParseIteration = async ({
	state,
	mimeType,
	contentLength,
	name,
}: {
	state: ParserState;
	mimeType: string | null;
	contentLength: number;
	name: string | null;
}): Promise<ParseResult> => {
	if (state.iterator.bytesRemaining() === 0) {
		return Promise.reject(new Error('no bytes'));
	}

	const structure = state.getStructureOrNull();

	if (structure === null) {
		await initVideo({state, mimeType, name, contentLength});
		return null;
	}

	if (structure.type === 'riff') {
		return parseRiff(state);
	}

	if (structure.type === 'mp3') {
		return parseMp3(state);
	}

	if (structure.type === 'iso-base-media') {
		return parseIsoBaseMedia(state);
	}

	if (structure.type === 'matroska') {
		return parseWebm(state);
	}

	if (structure.type === 'transport-stream') {
		return parseTransportStream(state);
	}

	if (structure.type === 'wav') {
		return parseWav(state);
	}

	if (structure.type === 'aac') {
		return parseAac(state);
	}

	if (structure.type === 'flac') {
		return parseFlac({state, iterator: state.iterator});
	}

	if (structure.type === 'm3u') {
		const box = parseM3u({
			iterator: state.iterator,
			structure,
			contentLength: state.contentLength,
		});
		const isDoneNow = state.iterator.counter.getOffset() === contentLength;
		if (isDoneNow) {
			const streams = getStreams(structure);

			// TODO: Select the first stream for now
			const selectedStream = streams[0];
			await fetchM3u8Stream(selectedStream);
			console.log(selectedStream);
		}

		return box;
	}

	return Promise.reject(
		new Error('Unknown video format ' + (structure satisfies never)),
	);
};
