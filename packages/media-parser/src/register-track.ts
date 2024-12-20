import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {Track, VideoTrack} from './get-tracks';
import type {ParseMediaContainer} from './options';
import type {ParserState} from './state/parser-state';

export const registerTrack = async ({
	options,
	track,
	container,
}: {
	options: ParserState;
	track: Track;
	container: ParseMediaContainer;
}) => {
	if (track.type === 'video') {
		options.tracks.addTrack(track);
		if (options.onVideoTrack) {
			const callback = await options.onVideoTrack({track, container});
			await options.registerVideoSampleCallback(
				track.trackId,
				callback ?? null,
			);
		}
	}

	if (track.type === 'audio') {
		options.tracks.addTrack(track);
		if (options.onAudioTrack) {
			const callback = await options.onAudioTrack({track, container});
			await options.registerAudioSampleCallback(
				track.trackId,
				callback ?? null,
			);
		}
	}
};

export const registerVideoTrackWhenProfileIsAvailable = ({
	options,
	track,
	container,
}: {
	options: ParserState;
	track: VideoTrack;
	container: ParseMediaContainer;
}) => {
	options.registerOnAvcProfileCallback(async (profile) => {
		await registerTrack({
			options,
			track: addAvcProfileToTrack(track, profile),
			container,
		});
	});
};
