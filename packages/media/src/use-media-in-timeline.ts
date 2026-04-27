import {useContext, useEffect, useState} from 'react';
import type {LoopDisplay, SequenceControls} from 'remotion';
import {Internals, type VolumeProp} from 'remotion';

export const useMediaInTimeline = ({
	volume,
	mediaVolume,
	src,
	mediaType,
	playbackRate,
	displayName,
	stack,
	showInTimeline,
	premountDisplay,
	postmountDisplay,
	loopDisplay,
	trimBefore,
	trimAfter,
	controls,
}: {
	volume: VolumeProp | undefined;
	mediaVolume: number;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	displayName: string | null;
	stack: string | null;
	showInTimeline: boolean;
	premountDisplay: number | null;
	postmountDisplay: number | null;
	loopDisplay: LoopDisplay | undefined;
	trimBefore: number | undefined;
	trimAfter: number | undefined;
	controls: SequenceControls | undefined;
}) => {
	const parentSequence = useContext(Internals.SequenceContext);
	const startsAt = Internals.useMediaStartsAt();
	const {registerSequence, unregisterSequence} = useContext(
		Internals.SequenceManager,
	);

	const [mediaId] = useState(() => String(Math.random()));

	const {
		volumes,
		duration,
		doesVolumeChange,
		nonce,
		rootId,
		isStudio,
		finalDisplayName,
	} = Internals.useBasicMediaInTimeline({
		volume,
		mediaVolume,
		mediaType,
		src,
		displayName,
		trimBefore,
		trimAfter,
		playbackRate,
	});

	useEffect(() => {
		if (!src) {
			throw new Error('No src passed');
		}

		if (!isStudio && window.process?.env?.NODE_ENV !== 'test') {
			return;
		}

		if (!showInTimeline) {
			return;
		}

		registerSequence({
			type: mediaType,
			src,
			id: mediaId,
			duration,
			from: 0,
			parent: parentSequence?.id ?? null,
			displayName: finalDisplayName,
			rootId,
			volume: volumes,
			showInTimeline: true,
			nonce: nonce.get(),
			startMediaFrom: 0 - startsAt + (trimBefore ?? 0),
			doesVolumeChange,
			loopDisplay,
			playbackRate,
			stack,
			premountDisplay,
			postmountDisplay,
			controls: controls ?? null,
		});

		return () => {
			unregisterSequence(mediaId);
		};
	}, [
		controls,
		doesVolumeChange,
		duration,
		finalDisplayName,
		isStudio,
		loopDisplay,
		mediaId,
		mediaType,
		nonce,
		parentSequence?.id,
		playbackRate,
		postmountDisplay,
		premountDisplay,
		registerSequence,
		rootId,
		showInTimeline,
		src,
		stack,
		startsAt,
		unregisterSequence,
		volumes,
		trimBefore,
	]);

	return {
		id: mediaId,
	};
};
