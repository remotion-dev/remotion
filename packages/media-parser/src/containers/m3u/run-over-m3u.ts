import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {ParserState} from '../../state/parser-state';
import {processM3uChunk} from './process-m3u-chunk';
import type {M3uStructure} from './types';

export const runOverM3u = async ({
	state,
	structure,
	playlistUrl,
	logLevel,
}: {
	state: ParserState;
	structure: M3uStructure;
	playlistUrl: string;
	logLevel: LogLevel;
}) => {
	console.log('---');
	const tracksDone = state.m3u.getTrackDone(playlistUrl);
	const hasAudioStreamToConsider =
		state.m3u.sampleSorter.hasAudioStreamToConsider(playlistUrl);
	const hasVideoStreamToConsider =
		state.m3u.sampleSorter.hasVideoStreamToConsider(playlistUrl);

	const audioDone = !hasAudioStreamToConsider && tracksDone;
	const videoDone = !hasVideoStreamToConsider && tracksDone;

	const bothDone = audioDone && videoDone;
	if (bothDone) {
		console.log('both done');
		state.m3u.setAllChunksProcessed(playlistUrl);
		return;
	}

	const existingRun = state.m3u.getM3uStreamRun(playlistUrl);

	if (existingRun) {
		Log.trace(logLevel, 'Existing M3U parsing process found for', playlistUrl);
		console.log('existing run');
		const run = await existingRun.continue();
		console.log('existing run, continued');
		state.m3u.setM3uStreamRun(playlistUrl, run);
		if (!run) {
			state.m3u.setAllChunksProcessed(playlistUrl);
		}

		return;
	}

	Log.trace(logLevel, 'Starting new M3U parsing process for', playlistUrl);

	const newRun = await processM3uChunk({
		playlistUrl,
		state,
		structure,
		audioDone,
		videoDone,
	});

	state.m3u.setM3uStreamRun(playlistUrl, newRun);
};
