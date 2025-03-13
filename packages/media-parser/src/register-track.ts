import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {AudioTrack, Track, VideoTrack} from './get-tracks';
import {Log} from './log';
import type {MediaParserContainer} from './options';
import type {ParserState} from './state/parser-state';

export const registerVideoTrack = async ({
	state,
	track,
	container,
}: {
	state: ParserState;
	track: Track;
	container: MediaParserContainer;
}) => {
	if (
		state.callbacks.tracks.getTracks().find((t) => t.trackId === track.trackId)
	) {
		Log.trace(
			state.logLevel,
			`Track ${track.trackId} already registered, skipping`,
		);
		return null;
	}

	if (track.type !== 'video') {
		throw new Error('Expected video track');
	}

	state.callbacks.tracks.addTrack(track);

	if (!state.onVideoTrack) {
		return null;
	}

	const callback = await state.onVideoTrack({track, container});
	await state.callbacks.registerVideoSampleCallback(
		track.trackId,
		callback ?? null,
	);

	return callback;
};

export const registerAudioTrack = async ({
	state,
	track,
	container,
}: {
	state: ParserState;
	track: AudioTrack;
	container: MediaParserContainer;
}) => {
	if (
		state.callbacks.tracks.getTracks().find((t) => t.trackId === track.trackId)
	) {
		Log.trace(
			state.logLevel,
			`Track ${track.trackId} already registered, skipping`,
		);
		return null;
	}

	if (track.type !== 'audio') {
		throw new Error('Expected audio track');
	}

	state.callbacks.tracks.addTrack(track);
	if (!state.onAudioTrack) {
		return null;
	}

	const callback = await state.onAudioTrack({track, container});
	await state.callbacks.registerAudioSampleCallback(
		track.trackId,
		callback ?? null,
	);
	return callback;
};

export const registerVideoTrackWhenProfileIsAvailable = ({
	state,
	track,
	container,
}: {
	state: ParserState;
	track: VideoTrack;
	container: MediaParserContainer;
}) => {
	state.riff.registerOnAvcProfileCallback(async (profile) => {
		await registerVideoTrack({
			state,
			track: addAvcProfileToTrack(track, profile),
			container,
		});
	});
};
