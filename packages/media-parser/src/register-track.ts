import {addAvcProfileToTrack} from './add-avc-profile-to-track';
import type {AudioTrack, Track, VideoTrack} from './get-tracks';
import type {LogLevel} from './log';
import {Log} from './log';
import type {MediaParserContainer} from './options';
import type {ParserState} from './state/parser-state';
import type {SampleCallbacks} from './state/sample-callbacks';
import {workOnSeekRequest} from './work-on-seek-request';

export const registerVideoTrack = async ({
	state,
	track,
	container,
	callbacks,
	logLevel,
}: {
	state: ParserState;
	track: Track;
	container: MediaParserContainer;
	callbacks: SampleCallbacks;
	logLevel: LogLevel;
}) => {
	if (callbacks.tracks.getTracks().find((t) => t.trackId === track.trackId)) {
		Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
		return null;
	}

	if (track.type !== 'video') {
		throw new Error('Expected video track');
	}

	callbacks.tracks.addTrack(track);

	if (!state.onVideoTrack) {
		return null;
	}

	const callback = await state.onVideoTrack({track, container});
	await callbacks.registerVideoSampleCallback(track.trackId, callback ?? null);

	await workOnSeekRequest({
		mode: state.mode,
		seekInfiniteLoop: state.seekInfiniteLoop,
		logLevel,
		controller: state.controller,
		videoSection: state.videoSection,
		mp4HeaderSegment: state.mp4HeaderSegment,
		isoState: state.iso,
		iterator: state.iterator,
		structureState: state.structure,
		callbacks: state.callbacks,
		src: state.src,
		contentLength: state.contentLength,
		readerInterface: state.readerInterface,
		currentReader: state.currentReader,
		discardReadBytes: state.discardReadBytes,
		fields: state.fields,
	});

	return callback;
};

export const registerAudioTrack = async ({
	state,
	track,
	container,
	callbacks,
	logLevel,
}: {
	state: ParserState;
	track: AudioTrack;
	container: MediaParserContainer;
	callbacks: SampleCallbacks;
	logLevel: LogLevel;
}) => {
	if (callbacks.tracks.getTracks().find((t) => t.trackId === track.trackId)) {
		Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
		return null;
	}

	if (track.type !== 'audio') {
		throw new Error('Expected audio track');
	}

	callbacks.tracks.addTrack(track);
	if (!state.onAudioTrack) {
		return null;
	}

	const callback = await state.onAudioTrack({track, container});
	await callbacks.registerAudioSampleCallback(track.trackId, callback ?? null);
	await workOnSeekRequest({
		mode: state.mode,
		seekInfiniteLoop: state.seekInfiniteLoop,
		logLevel,
		controller: state.controller,
		videoSection: state.videoSection,
		mp4HeaderSegment: state.mp4HeaderSegment,
		isoState: state.iso,
		iterator: state.iterator,
		structureState: state.structure,
		callbacks: state.callbacks,
		src: state.src,
		contentLength: state.contentLength,
		readerInterface: state.readerInterface,
		currentReader: state.currentReader,
		discardReadBytes: state.discardReadBytes,
		fields: state.fields,
	});

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
			callbacks: state.callbacks,
			logLevel: state.logLevel,
		});
	});
};
