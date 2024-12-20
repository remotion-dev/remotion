import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {Track, VideoTrack} from './get-tracks';
import type {ParseMediaContainer} from './options';
import type {ParserState} from './state/parser-state';

export const registerTrack = async ({
	state,
	track,
	container,
}: {
	state: ParserState;
	track: Track;
	container: ParseMediaContainer;
}) => {
	if (track.type === 'video') {
		state.callbacks.tracks.addTrack(track);
		if (state.onVideoTrack) {
			const callback = await state.onVideoTrack({track, container});
			await state.callbacks.registerVideoSampleCallback(
				track.trackId,
				callback ?? null,
			);
		}
	}

	if (track.type === 'audio') {
		state.callbacks.tracks.addTrack(track);
		if (state.onAudioTrack) {
			const callback = await state.onAudioTrack({track, container});
			await state.callbacks.registerAudioSampleCallback(
				track.trackId,
				callback ?? null,
			);
		}
	}
};

export const registerVideoTrackWhenProfileIsAvailable = ({
	state,
	track,
	container,
}: {
	state: ParserState;
	track: VideoTrack;
	container: ParseMediaContainer;
}) => {
	state.riff.registerOnAvcProfileCallback(async (profile) => {
		await registerTrack({
			state,
			track: addAvcProfileToTrack(track, profile),
			container,
		});
	});
};
