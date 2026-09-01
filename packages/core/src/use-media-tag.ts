import type {RefObject} from 'react';
import {useContext, useEffect, useRef} from 'react';
import {useLogging} from './log-level-context.js';
import {usePlayMedia} from './play-media.js';
import {playbackLogging} from './playback-logging.js';
import type {PlayableMediaTag} from './timeline-position-state.js';
import {useTimelineContext} from './timeline-position-state.js';
import {SetTimelineContext} from './TimelineContext.js';

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
	const logging = useLogging();
	const loggingRef = useRef(logging);
	loggingRef.current = logging;
	const playMedia = usePlayMedia();

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

				return playMedia({
					mediaRef,
					mediaType,
					onAutoPlayError,
					reason,
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
				...loggingRef.current,
				tag: 'pause',
				message: `Pausing ${media.src} because Player is not playing`,
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
		playMedia,
		subscribePlaying,
	]);
};
