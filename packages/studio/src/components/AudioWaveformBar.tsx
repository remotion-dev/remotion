import React, {useMemo} from 'react';
import {getTimelineLayerHeight} from '../helpers/timeline-layout';

export const WAVEFORM_BAR_LENGTH = 2;
export const WAVEFORM_BAR_MARGIN = 1;

const container: React.CSSProperties = {
	width: WAVEFORM_BAR_LENGTH,
	backgroundColor: 'rgba(255, 255, 255, 0.6)',
	marginLeft: WAVEFORM_BAR_MARGIN,
	borderRadius: 2,
};

// Sonnet:
/**
 *
 * consider a sinus wave with an amplitude going from [-1, 1].
 * if we sample it infinitely, and convert all negative samples from negative to positive
 * what is the average of all samples?
 *
 * Answer: 2 / Math.PI = 0.6366
 */

export const AudioWaveformBar: React.FC<{
	readonly amplitude: number;
}> = ({amplitude}) => {
	const style = useMemo(() => {
		return {
			...container,
			height: getTimelineLayerHeight('other') * amplitude * (1 / 0.6366),
		};
	}, [amplitude]);
	return <div style={style} />;
};
