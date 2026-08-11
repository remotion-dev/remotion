import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {
	MediaParserAudioTrack,
	MediaParserTrack,
	MediaParserVideoTrack,
} from './get-tracks';
import type {MediaParserLogLevel} from './log';
import {Log} from './log';
import type {MediaParserContainer} from './options';
import type {TracksState} from './state/has-tracks-section';
import type {ParserState} from './state/parser-state';
import type {CallbacksState} from './state/sample-callbacks';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from './webcodec-sample-types';

export const registerVideoTrack = async ({
	track,
	container,
	logLevel,
	onVideoTrack,
	registerVideoSampleCallback,
	tracks,
}: {
	track: MediaParserTrack;
	container: MediaParserContainer;
	logLevel: MediaParserLogLevel;
	onVideoTrack: MediaParserOnVideoTrack | null;
	registerVideoSampleCallback: CallbacksState['registerVideoSampleCallback'];
	tracks: TracksState;
}) => {
	if (tracks.getTracks().find((t) => t.trackId === track.trackId)) {
		Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
		return null;
	}

	if (track.type !== 'video') {
		throw new Error('Expected video track');
	}

	tracks.addTrack(track);

	if (!onVideoTrack) {
		return null;
	}

	const callback = await onVideoTrack({
		track,
		container,
	});

	await registerVideoSampleCallback(track.trackId, callback ?? null);

	return callback;
};

export const registerAudioTrack = async ({
	track,
	container,
	tracks,
	logLevel,
	onAudioTrack,
	registerAudioSampleCallback,
}: {
	track: MediaParserAudioTrack;
	container: MediaParserContainer;
	tracks: TracksState;
	logLevel: MediaParserLogLevel;
	onAudioTrack: MediaParserOnAudioTrack | null;
	registerAudioSampleCallback: CallbacksState['registerAudioSampleCallback'];
}) => {
	if (tracks.getTracks().find((t) => t.trackId === track.trackId)) {
		Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
		return null;
	}

	if (track.type !== 'audio') {
		throw new Error('Expected audio track');
	}

	tracks.addTrack(track);
	if (!onAudioTrack) {
		return null;
	}

	const callback = await onAudioTrack({
		track,
		container,
	});
	await registerAudioSampleCallback(track.trackId, callback ?? null);

	return callback;
};

export const registerVideoTrackWhenProfileIsAvailable = ({
	state,
	track,
	container,
}: {
	state: ParserState;
	track: MediaParserVideoTrack;
	container: MediaParserContainer;
}) => {
	state.riff.registerOnAvcProfileCallback(async (profile) => {
		await registerVideoTrack({
			track: addAvcProfileToTrack(track, profile),
			container,
			logLevel: state.logLevel,
			onVideoTrack: state.onVideoTrack,
			registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
			tracks: state.callbacks.tracks,
		});
	});
};
