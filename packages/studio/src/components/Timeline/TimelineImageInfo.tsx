import React, {useMemo} from 'react';
import {BLACK_ALPHA_30} from '../../helpers/colors';
import {getTimelineLayerHeight} from '../../helpers/timeline-layout';

const HEIGHT = getTimelineLayerHeight('image') - 2;

const containerStyle: React.CSSProperties = {
	height: HEIGHT,
	width: '100%',
	backgroundColor: BLACK_ALPHA_30,
	display: 'flex',
	borderTopLeftRadius: 2,
	borderBottomLeftRadius: 2,
	backgroundRepeat: 'repeat-x',
	backgroundSize: 'auto 100%',
	backgroundPositionY: 0,
};

export const TimelineImageInfo: React.FC<{
	readonly src: string;
	readonly offsetInPixels: number;
}> = ({src, offsetInPixels}) => {
	const style = useMemo((): React.CSSProperties => {
		return {
			...containerStyle,
			// This is Studio UI, not a Remotion composition that needs to wait for
			// background images before rendering.
			backgroundImage: `url(${JSON.stringify(src)})`,
			backgroundPositionX: -offsetInPixels,
		};
	}, [offsetInPixels, src]);

	return <div style={style} />;
};
