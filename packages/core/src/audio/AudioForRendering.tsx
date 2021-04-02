import React, {useContext, useEffect, useMemo} from 'react';
import {CompositionManager} from '../CompositionManager';
import {isRemoteAsset} from '../is-remote-asset';
import {random} from '../random';
import {SequenceContext} from '../sequencing';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {evaluateVolume} from '../volume-prop';
import {RemotionAudioProps} from './props';
import {useAudioFrame} from './use-audio-frame';

export const AudioForRendering: React.FC<RemotionAudioProps> = (props) => {
	const absoluteFrame = useAbsoluteCurrentFrame();
	const audioFrame = useAudioFrame();
	const frame = useCurrentFrame();
	const sequenceContext = useContext(SequenceContext);
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`audio-${random(props.src ?? '')}-${sequenceContext?.relativeFrom}-${
				sequenceContext?.cumulatedFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[props.muted, props.src, sequenceContext]
	);

	const volume = evaluateVolume({
		volume: props.volume,
		frame: audioFrame,
	});

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		registerAsset({
			type: 'audio',
			src: props.src,
			id,
			frame: absoluteFrame,
			volume,
			isRemote: isRemoteAsset(props.src),
			mediaFrame: frame,
		});
		return () => unregisterAsset(id);
	}, [
		props.muted,
		props.src,
		registerAsset,
		absoluteFrame,
		id,
		unregisterAsset,
		volume,
		audioFrame,
		frame,
	]);

	return null;
};
