import type {RefObject} from 'react';
import {useContext, useEffect} from 'react';
import {useLogLevel, useMountTime} from './log-level-context.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import type {PlayableMediaTag} from './timeline-position-state.js';
import {TimelineContext} from './timeline-position-state.js';
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
	const {audioAndVideoTags, imperativePlaying} = useContext(TimelineContext);
	const logLevel = useLogLevel();
	const mountTime = useMountTime();
	const env = useRemotionEnvironment();

	useEffect(() => {
		const tag: PlayableMediaTag = {
			id,
			play: (reason) => {
				if (!imperativePlaying.current) {
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

		return () => {
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
		imperativePlaying,
		isPremounting,
		isPostmounting,
		logLevel,
		mountTime,
		env.isPlayer,
	]);
};
