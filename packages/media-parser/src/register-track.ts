import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {Track, VideoTrack} from './get-tracks';
import type {ParseMediaContainer} from './options';
import type {ParserContext} from './parser-context';

export const registerTrack = async ({
	options,
	track,
	container,
}: {
	options: ParserContext;
	track: Track;
	container: ParseMediaContainer;
}) => {
	if (track.type === 'video') {
		options.parserState.tracks.addTrack(track);
		if (options.onVideoTrack) {
			const callback = await options.onVideoTrack({track, container});
			await options.parserState.registerVideoSampleCallback(
				track.trackId,
				callback ?? null,
			);
		}
	}

	if (track.type === 'audio') {
		options.parserState.tracks.addTrack(track);
		if (options.onAudioTrack) {
			const callback = await options.onAudioTrack({track, container});
			await options.parserState.registerAudioSampleCallback(
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
	options: ParserContext;
	track: VideoTrack;
	container: ParseMediaContainer;
}) => {
	options.parserState.registerOnAvcProfileCallback(async (profile) => {
		await registerTrack({
			options,
			track: addAvcProfileToTrack(track, profile),
			container,
		});
	});
};
