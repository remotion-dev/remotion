import type {RefObject} from 'react';
import {useContext, useEffect, useRef} from 'react';
import {useLogLevel, useMountTime} from './log-level-context.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {playbackLogging} from './playback-logging.js';
import type {PlayableMediaTag} from './timeline-position-state.js';
import {useTimelineContext} from './timeline-position-state.js';
import {SetTimelineContext} from './TimelineContext.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

export const useMediaTag = ({
	mediaRef,
	id,
	mediaType,
	onAutoPlayError,
	isPremounting,
	isPostmounting,
}: {
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement | null>;
	id: string;
	mediaType: 'audio' | 'video';
	onAutoPlayError: null | (() => void);
	isPremounting: boolean;
	isPostmounting: boolean;
}) => {
	const {audioAndVideoTags, isPlaying} = useTimelineContext();
	const {subscribePlaying} = useContext(SetTimelineContext);
	const isPlayingRef = useRef(isPlaying);
	isPlayingRef.current = isPlaying;
	const logLevel = useLogLevel();
	const mountTime = useMountTime();
	const env = useRemotionEnvironment();

	useEffect(() => {
		const tag: PlayableMediaTag = {
			id,
			play: (reason) => {
				if (!isPlayingRef.current()) {
					// Don't play if for example in a <Freeze> state.
					return;
				}

				if (isPremounting || isPostmounting) {
					return;
				}

				return playAndHandleNotAllowedError({
					mediaRef,
					mediaType,
					onAutoPlayError,
					logLevel,
					mountTime,
					reason,
					isPlayer: env.isPlayer,
				});
			},
		};
		audioAndVideoTags.current.push(tag);
		const unsubscribe = subscribePlaying((state) => {
			if (state.playing) {
				return;
			}

			const media = mediaRef.current;
			if (!media || media.paused) {
				return;
			}

			playbackLogging({
				logLevel,
				tag: 'pause',
				message: `Pausing ${media.src} because Player is not playing`,
				mountTime,
			});
			media.pause();
		});

		return () => {
			unsubscribe();
			audioAndVideoTags.current = audioAndVideoTags.current.filter(
				(a) => a.id !== id,
			);
		};
	}, [
		audioAndVideoTags,
		id,
		mediaRef,
		mediaType,
		onAutoPlayError,
		isPremounting,
		isPostmounting,
		logLevel,
		mountTime,
		env.isPlayer,
		subscribePlaying,
	]);
};
