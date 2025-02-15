import type {RefObject} from 'react';
import {useContext, useEffect, useMemo, useState} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {SequenceManager} from './SequenceManager.js';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {getAssetDisplayName} from './get-asset-file-name.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {useLogLevel, useMountTime} from './log-level-context.js';
import {useNonce} from './nonce.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import type {PlayableMediaTag} from './timeline-position-state.js';
import {TimelineContext} from './timeline-position-state.js';
import {useVideoConfig} from './use-video-config.js';
import type {VolumeProp} from './volume-prop.js';
import {evaluateVolume} from './volume-prop.js';

const didWarn: {[key: string]: boolean} = {};
const warnOnce = (message: string) => {
	if (didWarn[message]) {
		return;
	}

	// eslint-disable-next-line no-console
	console.warn(message);
	didWarn[message] = true;
};

export const useMediaInTimeline = ({
	volume,
	mediaVolume,
	mediaRef,
	src,
	mediaType,
	playbackRate,
	displayName,
	id,
	stack,
	showInTimeline,
	premountDisplay,
	onAutoPlayError,
	isPremounting,
}: {
	volume: VolumeProp | undefined;
	mediaVolume: number;
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement | null>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	displayName: string | null;
	id: string;
	stack: string | null;
	showInTimeline: boolean;
	premountDisplay: number | null;
	onAutoPlayError: null | (() => void);
	isPremounting: boolean;
}) => {
	const videoConfig = useVideoConfig();
	const {rootId, audioAndVideoTags} = useContext(TimelineContext);
	const parentSequence = useContext(SequenceContext);
	const actualFrom = parentSequence
		? parentSequence.relativeFrom + parentSequence.cumulatedFrom
		: 0;
	const {imperativePlaying} = useContext(TimelineContext);
	const startsAt = useMediaStartsAt();
	const {registerSequence, unregisterSequence} = useContext(SequenceManager);
	const [initialVolume] = useState<VolumeProp | undefined>(() => volume);
	const logLevel = useLogLevel();
	const mountTime = useMountTime();

	const nonce = useNonce();

	const duration = parentSequence
		? Math.min(parentSequence.durationInFrames, videoConfig.durationInFrames)
		: videoConfig.durationInFrames;
	const doesVolumeChange = typeof volume === 'function';

	const volumes: string | number = useMemo(() => {
		if (typeof volume === 'number') {
			return volume;
		}

		return new Array(Math.floor(Math.max(0, duration + startsAt)))
			.fill(true)
			.map((_, i) => {
				return evaluateVolume({
					frame: i + startsAt,
					volume,
					mediaVolume,
					allowAmplificationDuringRender: false,
				});
			})
			.join(',');
	}, [duration, startsAt, volume, mediaVolume]);

	useEffect(() => {
		if (typeof volume === 'number' && volume !== initialVolume) {
			warnOnce(
				`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/using-audio/#controlling-volume`,
			);
		}
	}, [initialVolume, mediaType, src, volume]);

	useEffect(() => {
		if (!mediaRef.current) {
			return;
		}

		if (!src) {
			throw new Error('No src passed');
		}

		if (
			!getRemotionEnvironment().isStudio &&
			window.process?.env?.NODE_ENV !== 'test'
		) {
			return;
		}

		if (!showInTimeline) {
			return;
		}

		registerSequence({
			type: mediaType,
			src,
			id,
			duration,
			from: 0,
			parent: parentSequence?.id ?? null,
			displayName: displayName ?? getAssetDisplayName(src),
			rootId,
			volume: volumes,
			showInTimeline: true,
			nonce,
			startMediaFrom: 0 - startsAt,
			doesVolumeChange,
			loopDisplay: undefined,
			playbackRate,
			stack,
			premountDisplay,
		});
		return () => {
			unregisterSequence(id);
		};
	}, [
		actualFrom,
		duration,
		id,
		parentSequence,
		src,
		registerSequence,
		rootId,
		unregisterSequence,
		videoConfig,
		volumes,
		doesVolumeChange,
		nonce,
		mediaRef,
		mediaType,
		startsAt,
		playbackRate,
		displayName,
		stack,
		showInTimeline,
		premountDisplay,
	]);

	useEffect(() => {
		const tag: PlayableMediaTag = {
			id,
			play: (reason) => {
				if (!imperativePlaying.current) {
					// Don't play if for example in a <Freeze> state.
					return;
				}

				if (isPremounting) {
					return;
				}

				return playAndHandleNotAllowedError({
					mediaRef,
					mediaType,
					onAutoPlayError,
					logLevel,
					mountTime,
					reason,
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
		logLevel,
		mountTime,
	]);
};
