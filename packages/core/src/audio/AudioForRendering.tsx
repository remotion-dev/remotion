import React, {useContext, useEffect} from 'react';
import {CompositionManager} from '../CompositionManager';
import {useAbsoluteCurrentFrame} from '../use-frame';
import {RemotionAudioProps} from './props';

export const AudioForRendering: React.FC<RemotionAudioProps> = (props) => {
	const absoluteFrame = useAbsoluteCurrentFrame();
	const {registerAsset} = useContext(CompositionManager);

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		registerAsset({
			type: 'audio',
			src: props.src,
		});
	}, [props.src, registerAsset, absoluteFrame]);

	return null;
};
