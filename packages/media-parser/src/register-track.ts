import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {Track, VideoTrack} from './get-tracks';
import type {ParserContext} from './parser-context';
import type {ParserState} from './state/parser-state';

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

export const registerVideoTrackWhenProfileIsAvailable = ({
	options,
	state,
	track,
}: {
	state: ParserState;
	options: ParserContext;
	track: VideoTrack;
}) => {
	state.registerOnAvcProfileCallback(async (profile) => {
		await registerTrack({
			options,
			state,
			track: addAvcProfileToTrack(track, profile),
		});
	});
};
