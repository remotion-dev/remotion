import type {Track} from './get-tracks';
import type {ParserContext} from './parser-context';
import type {ParserState} from './parser-state';

export const registerTrack = async ({
	state,
	options,
	track,
}: {
	state: ParserState;
	options: ParserContext;
	track: Track;
}) => {
	if (track.type === 'video' && options.onVideoTrack) {
		const callback = await options.onVideoTrack(track);
		await state.registerVideoSampleCallback(track.trackId, callback ?? null);
	}

	if (track.type === 'audio' && options.onAudioTrack) {
		const callback = await options.onAudioTrack(track);
		await state.registerAudioSampleCallback(track.trackId, callback ?? null);
	}
};
