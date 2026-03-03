import type React from 'react';
import {useContext, useLayoutEffect} from 'react';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {MediaPlayer} from './media-player';
import {setGlobalTimeAnchor} from './set-global-time-anchor';

export const useCommonEffects = ({
	mediaPlayerRef,
	mediaPlayerReady,
	currentTimeRef,
	playing,
	isPlayerBuffering,
	frame,
	trimBefore,
	trimAfter,
	effectiveMuted,
	userPreferredVolume,
	playbackRate,
	globalPlaybackRate,
	fps,
	sequenceOffset,
	loop,
	debugAudioScheduling,
	durationInFrames,
	isPremounting,
	isPostmounting,
	currentTime,
	logLevel,
	sharedAudioContext,
	label,
}: {
	readonly mediaPlayerRef: React.RefObject<MediaPlayer | null>;
	readonly mediaPlayerReady: boolean;
	readonly currentTimeRef: React.RefObject<number>;
	readonly playing: boolean;
	readonly isPlayerBuffering: boolean;
	readonly frame: number;
	readonly trimBefore: number | undefined;
	readonly trimAfter: number | undefined;
	readonly effectiveMuted: boolean;
	readonly userPreferredVolume: number;
	readonly playbackRate: number;
	readonly globalPlaybackRate: number;
	readonly fps: number;
	readonly sequenceOffset: number;
	readonly loop: boolean;
	readonly debugAudioScheduling: boolean;
	readonly durationInFrames: number;
	readonly isPremounting: boolean;
	readonly isPostmounting: boolean;
	readonly currentTime: number;
	readonly logLevel: LogLevel;
	readonly sharedAudioContext: {
		readonly audioContext: AudioContext | null;
		readonly audioSyncAnchor: {value: number};
	} | null;
	readonly label: string;
}) => {
	const absoluteTime = Internals.useAbsoluteTimelinePosition();
	const {playing: playingWhilePremounting} = useContext(
		Internals.PremountContext,
	);

	useLayoutEffect(() => {
		if (
			sharedAudioContext?.audioContext &&
			sharedAudioContext.audioSyncAnchor
		) {
			setGlobalTimeAnchor({
				audioContext: sharedAudioContext.audioContext,
				audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
				absoluteTimeInSeconds: absoluteTime / fps,
				globalPlaybackRate,
				debugAudioScheduling,
				logLevel,
			});
		}
	}, [
		absoluteTime,
		globalPlaybackRate,
		sharedAudioContext,
		fps,
		debugAudioScheduling,
		logLevel,
	]);

	if (playingWhilePremounting) {
		mediaPlayerRef.current?.playAudio();
	}

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer) return;

		if (playing && !isPlayerBuffering) {
			mediaPlayer.play();
		} else {
			mediaPlayer.pause();
		}
	}, [
		isPlayerBuffering,
		playing,
		logLevel,
		mediaPlayerReady,
		frame,
		mediaPlayerRef,
	]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setTrimBefore(trimBefore, currentTimeRef.current);
	}, [trimBefore, mediaPlayerReady, mediaPlayerRef, currentTimeRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setTrimAfter(trimAfter, currentTimeRef.current);
	}, [trimAfter, mediaPlayerReady, mediaPlayerRef, currentTimeRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.setMuted(effectiveMuted);
	}, [effectiveMuted, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setVolume(userPreferredVolume);
	}, [userPreferredVolume, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setPlaybackRate(playbackRate, currentTimeRef.current);
	}, [playbackRate, mediaPlayerReady, mediaPlayerRef, currentTimeRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setGlobalPlaybackRate(globalPlaybackRate);
	}, [globalPlaybackRate, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setLoop(loop);
	}, [loop, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setDurationInFrames(durationInFrames);
	}, [durationInFrames, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setIsPremounting(isPremounting);
	}, [isPremounting, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setIsPostmounting(isPostmounting);
	}, [isPostmounting, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setFps(fps);
	}, [fps, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setSequenceOffset(sequenceOffset);
	}, [sequenceOffset, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setDebugAudioScheduling(debugAudioScheduling);
	}, [debugAudioScheduling, mediaPlayerReady, mediaPlayerRef]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.seekTo(currentTime).catch(() => {
			// Might be disposed
		});
		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[${label}] Updating target time to ${currentTime.toFixed(3)}s`,
		);
	}, [currentTime, logLevel, mediaPlayerReady, label, mediaPlayerRef]);
};
