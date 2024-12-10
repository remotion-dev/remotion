import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {Track, VideoTrack} from './get-tracks';
import type {ParserContext} from './parser-context';

export const registerTrack = async ({
	options,
	track,
}: {
	options: ParserContext;
	track: Track;
}) => {
	if (track.type === 'video') {
		options.parserState.tracks.addTrack(track);
		if (options.onVideoTrack) {
			const callback = await options.onVideoTrack(track);
			await options.parserState.registerVideoSampleCallback(
				track.trackId,
				callback ?? null,
			);
		}
	}

	if (track.type === 'audio') {
		options.parserState.tracks.addTrack(track);
		if (options.onAudioTrack) {
			const callback = await options.onAudioTrack(track);
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
}: {
	options: ParserContext;
	track: VideoTrack;
}) => {
	options.parserState.registerOnAvcProfileCallback(async (profile) => {
		await registerTrack({
			options,
			track: addAvcProfileToTrack(track, profile),
		});
	});
};
