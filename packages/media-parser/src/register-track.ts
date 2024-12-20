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
		state.sample.tracks.addTrack(track);
		if (state.onVideoTrack) {
			const callback = await state.onVideoTrack({track, container});
			await state.sample.registerVideoSampleCallback(
				track.trackId,
				callback ?? null,
			);
		}
	}

	if (track.type === 'audio') {
		state.sample.tracks.addTrack(track);
		if (state.onAudioTrack) {
			const callback = await state.onAudioTrack({track, container});
			await state.sample.registerAudioSampleCallback(
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
