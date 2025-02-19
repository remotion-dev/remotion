import React, {useMemo} from 'react';
import {TIMELINE_LAYER_HEIGHT} from '../helpers/timeline-layout';

export const WAVEFORM_BAR_LENGTH = 4;
export const WAVEFORM_BAR_MARGIN = 2;

const container: React.CSSProperties = {
	width: WAVEFORM_BAR_LENGTH,
	backgroundColor: 'rgba(255, 255, 255, 0.2)',
	marginLeft: WAVEFORM_BAR_MARGIN,
	borderRadius: 2,
};

export const AudioWaveformBar: React.FC<{
	readonly amplitude: number;
}> = ({amplitude}) => {
	const style = useMemo(() => {
		return {
			...container,
			height: (TIMELINE_LAYER_HEIGHT / 2) * amplitude,
		};
	}, [amplitude]);
	return <div style={style} />;
};
