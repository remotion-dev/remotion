import {useContext, useEffect, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals, useCurrentFrame, type VolumeProp} from 'remotion';

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
	loopDisplay: _InternalTypes['LoopDisplay'] | undefined;
}) => {
	const parentSequence = useContext(Internals.SequenceContext);
	const startsAt = Internals.useMediaStartsAt();
	const {registerSequence, unregisterSequence} = useContext(
		Internals.SequenceManager,
	);

	const [sequenceId] = useState(() => String(Math.random()));
	const [mediaId] = useState(() => String(Math.random()));
	const frame = useCurrentFrame();

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

		const loopIteration = loopDisplay
			? Math.floor(frame / loopDisplay.durationInFrames)
			: 0;

		registerSequence({
			type: 'sequence',
			premountDisplay,
			postmountDisplay,
			parent: parentSequence?.id ?? null,
			displayName: finalDisplayName,
			rootId,
			showInTimeline: true,
			nonce,
			loopDisplay,
			stack,
			from: 0,
			duration,
			id: sequenceId,
		});

		registerSequence({
			type: mediaType,
			src,
			id: mediaId,
			duration: loopDisplay?.durationInFrames ?? duration,
			from: loopDisplay ? loopIteration * loopDisplay.durationInFrames : 0,
			parent: sequenceId,
			displayName: finalDisplayName,
			rootId,
			volume: volumes,
			showInTimeline: true,
			nonce,
			startMediaFrom: 0 - startsAt,
			doesVolumeChange,
			loopDisplay: undefined,
			playbackRate,
			stack,
			premountDisplay: null,
			postmountDisplay: null,
		});

		return () => {
			unregisterSequence(sequenceId);
			unregisterSequence(mediaId);
		};
	}, [
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
		sequenceId,
		showInTimeline,
		src,
		stack,
		startsAt,
		unregisterSequence,
		volumes,
		frame,
	]);
};
