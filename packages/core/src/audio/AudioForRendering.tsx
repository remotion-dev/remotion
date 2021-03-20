import React, {useContext, useEffect, useState} from 'react';
import {CompositionManager} from '../CompositionManager';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {RemotionAudioProps} from './props';

export const AudioForRendering: React.FC<RemotionAudioProps> = (props) => {
	const absoluteFrame = useAbsoluteCurrentFrame();
	const sequenceFrame = useCurrentFrame();
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	const [id] = useState(() => String(Math.random()));

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
