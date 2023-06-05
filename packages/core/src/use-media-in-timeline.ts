import type {RefObject} from 'react';
import {useContext, useEffect, useMemo, useState} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {getAssetDisplayName} from './get-asset-file-name.js';
import {useRemotionEnvironment} from './get-environment.js';
import {useNonce} from './nonce.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceManager} from './SequenceManager.js';
import type {PlayableMediaTag} from './timeline-position-state.js';
import {TimelineContext, usePlayingState} from './timeline-position-state.js';
import {useVideoConfig} from './use-video-config.js';
import type {VolumeProp} from './volume-prop.js';
import {evaluateVolume} from './volume-prop.js';

const didWarn: {[key: string]: boolean} = {};
const warnOnce = (message: string) => {
	if (didWarn[message]) {
		return;
	}

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
}: {
	volume: VolumeProp | undefined;
	mediaVolume: number;
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
}) => {
	const videoConfig = useVideoConfig();
	const {rootId, audioAndVideoTags} = useContext(TimelineContext);
	const parentSequence = useContext(SequenceContext);
	const actualFrom = parentSequence
		? parentSequence.relativeFrom + parentSequence.cumulatedFrom
		: 0;
	const [playing] = usePlayingState();
	const startsAt = useMediaStartsAt();
	const {registerSequence, unregisterSequence} = useContext(SequenceManager);
	const [id] = useState(() => String(Math.random()));
	const [initialVolume] = useState<VolumeProp | undefined>(() => volume);

	const nonce = useNonce();

	const duration = parentSequence
		? Math.min(parentSequence.durationInFrames, videoConfig.durationInFrames)
		: videoConfig.durationInFrames;
	const doesVolumeChange = typeof volume === 'function';

	const environment = useRemotionEnvironment();

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
				`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/using-audio/#controlling-volume`
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

		if (environment !== 'preview' && process.env.NODE_ENV !== 'test') {
			return;
		}

		registerSequence({
			type: mediaType,
			src,
			id,
			duration,
			from: 0,
			parent: parentSequence?.id ?? null,
			displayName: getAssetDisplayName(src),
			rootId,
			volume: volumes,
			showInTimeline: true,
			nonce,
			startMediaFrom: 0 - startsAt,
			doesVolumeChange,
			loopDisplay: undefined,
			playbackRate,
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
		environment,
	]);

	useEffect(() => {
		const tag: PlayableMediaTag = {
			id,
			play: () => {
				if (!playing) {
					// Don't play if for example in a <Freeze> state.
					return;
				}

				return playAndHandleNotAllowedError(mediaRef, mediaType);
			},
		};
		audioAndVideoTags.current.push(tag);

		return () => {
			audioAndVideoTags.current = audioAndVideoTags.current.filter(
				(a) => a.id !== id
			);
		};
	}, [audioAndVideoTags, id, mediaRef, mediaType, playing]);
};
