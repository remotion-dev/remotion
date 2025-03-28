import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {AudioTrack, Track, VideoTrack} from './get-tracks';
import type {LogLevel} from './log';
import {Log} from './log';
import type {MediaParserContainer} from './options';
import type {ParserState} from './state/parser-state';
import type {SampleCallbacks} from './state/sample-callbacks';
import type {OnAudioTrack, OnVideoTrack} from './webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from './work-on-seek-request';
import {
	getWorkOnSeekRequestOptions,
	workOnSeekRequest,
} from './work-on-seek-request';

export const registerVideoTrack = async ({
	track,
	container,
	callbacks,
	logLevel,
	workOnSeekRequestOptions,
	onVideoTrack,
}: {
	track: Track;
	container: MediaParserContainer;
	callbacks: SampleCallbacks;
	logLevel: LogLevel;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions | null;
	onVideoTrack: OnVideoTrack | null;
}) => {
	if (callbacks.tracks.getTracks().find((t) => t.trackId === track.trackId)) {
		Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
		return null;
	}

	if (track.type !== 'video') {
		throw new Error('Expected video track');
	}

	callbacks.tracks.addTrack(track);

	if (!onVideoTrack) {
		return null;
	}

	const callback = await onVideoTrack({
		track,
		container,
	});

	await callbacks.registerVideoSampleCallback(track.trackId, callback ?? null);

	if (workOnSeekRequestOptions) {
		await workOnSeekRequest(workOnSeekRequestOptions);
	}

	return callback;
};

export const registerAudioTrack = async ({
	workOnSeekRequestOptions,
	track,
	container,
	callbacks,
	logLevel,
	onAudioTrack,
}: {
	workOnSeekRequestOptions: WorkOnSeekRequestOptions | null;
	track: AudioTrack;
	container: MediaParserContainer;
	callbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
}) => {
	if (callbacks.tracks.getTracks().find((t) => t.trackId === track.trackId)) {
		Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
		return null;
	}

	if (track.type !== 'audio') {
		throw new Error('Expected audio track');
	}

	callbacks.tracks.addTrack(track);
	if (!onAudioTrack) {
		return null;
	}

	const callback = await onAudioTrack({
		track,
		container,
	});
	await callbacks.registerAudioSampleCallback(track.trackId, callback ?? null);
	if (workOnSeekRequestOptions) {
		await workOnSeekRequest(workOnSeekRequestOptions);
	}

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
			workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
			track: addAvcProfileToTrack(track, profile),
			container,
			callbacks: state.callbacks,
			logLevel: state.logLevel,
			onVideoTrack: state.onVideoTrack,
		});
	});
};
