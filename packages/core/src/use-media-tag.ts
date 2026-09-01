import type {RefObject} from 'react';
import {useEffect} from 'react';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import type {PlayableMediaTag} from './timeline-position-state.js';
import {useTimelineContext} from './timeline-position-state.js';
import {useLogger} from './use-logger.js';
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
	const {audioAndVideoTags, imperativePlaying} = useTimelineContext();
	const logger = useLogger();
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
					logger,
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
		// The logger has stable identity and reads the latest context.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		audioAndVideoTags,
		id,
		mediaRef,
		mediaType,
		onAutoPlayError,
		imperativePlaying,
		isPremounting,
		isPostmounting,
		env.isPlayer,
	]);
};
