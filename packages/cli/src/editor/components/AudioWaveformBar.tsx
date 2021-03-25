import React, {useMemo} from 'react';
import {TIMELINE_LAYER_HEIGHT} from '../helpers/timeline-layout';

const container: React.CSSProperties = {
	width: 4,
	backgroundColor: 'rgba(255, 255, 255, 0.2)',
	marginLeft: 2,
	borderRadius: 2,
};

export const AudioWaveformBar: React.FC<{
	amplitude: number;
}> = ({amplitude}) => {
	const style = useMemo(() => {
		return {
			...container,
			height: (TIMELINE_LAYER_HEIGHT / 2) * amplitude,
		};
	}, [amplitude]);
	return <div style={style} />;
};
