import {useContext, useEffect, useMemo, useState} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {SequenceManager} from './SequenceManager.js';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {getAssetDisplayName} from './get-asset-file-name.js';
import {useNonce} from './nonce.js';
import {TimelineContext} from './timeline-position-state.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
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
	src,
	mediaType,
	playbackRate,
	displayName,
	id,
	stack,
	showInTimeline,
	premountDisplay,
	postmountDisplay,
}: {
	volume: VolumeProp | undefined;
	mediaVolume: number;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	displayName: string | null;
	id: string;
	stack: string | null;
	showInTimeline: boolean;
	premountDisplay: number | null;
	postmountDisplay: number | null;
}) => {
	const videoConfig = useVideoConfig();
	const parentSequence = useContext(SequenceContext);
	const actualFrom = parentSequence
		? parentSequence.relativeFrom + parentSequence.cumulatedFrom
		: 0;
	const startsAt = useMediaStartsAt();
	const {registerSequence, unregisterSequence} = useContext(SequenceManager);
	const [initialVolume] = useState<VolumeProp | undefined>(() => volume);

	const nonce = useNonce();
	const {rootId} = useContext(TimelineContext);

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
				});
			})
			.join(',');
	}, [duration, startsAt, volume, mediaVolume]);

	useEffect(() => {
		if (typeof volume === 'number' && volume !== initialVolume) {
			warnOnce(
				`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/audio/volume`,
			);
		}
	}, [initialVolume, mediaType, src, volume]);

	const env = useRemotionEnvironment();

	useEffect(() => {
		if (!src) {
			throw new Error('No src passed');
		}

		if (!env.isStudio && window.process?.env?.NODE_ENV !== 'test') {
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
			postmountDisplay,
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
		mediaType,
		startsAt,
		playbackRate,
		displayName,
		stack,
		showInTimeline,
		premountDisplay,
		postmountDisplay,
		env.isStudio,
	]);
};
