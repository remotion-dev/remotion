import React, {useContext, useEffect, useMemo} from 'react';
import {CompositionManager} from '../CompositionManager';
import {random} from '../random';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {RemotionAudioProps} from './props';

export const AudioForRendering: React.FC<RemotionAudioProps> = (props) => {
	const absoluteFrame = useAbsoluteCurrentFrame();
	const sequenceFrame = useCurrentFrame();
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() => `audio-${random(props.src ?? '')}-muted:${props.muted}`,
		[props.muted, props.src]
	);

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
			sequenceFrame,
			volume: props.volume ?? 1,
		});
		return () => unregisterAsset(id);
	}, [
		props.muted,
		props.src,
		registerAsset,
		absoluteFrame,
		id,
		unregisterAsset,
		sequenceFrame,
		props.volume,
	]);

	return null;
};
