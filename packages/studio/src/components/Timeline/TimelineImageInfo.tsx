import {drawRepeatingImageThumbnail} from '@remotion/timeline-utils';
import React, {useEffect, useRef} from 'react';
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
};

export const TimelineImageInfo: React.FC<{
	readonly src: string;
	readonly visualizationWidth: number;
}> = ({src, visualizationWidth}) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const canvas = document.createElement('canvas');
		canvas.width = visualizationWidth * window.devicePixelRatio;
		canvas.height = HEIGHT * window.devicePixelRatio;
		canvas.style.width = visualizationWidth + 'px';
		canvas.style.height = HEIGHT + 'px';
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		current.appendChild(canvas);

		const img = new Image();
		img.crossOrigin = 'anonymous';

		img.onload = () => {
			drawRepeatingImageThumbnail({
				canvas,
				image: img,
			});
		};

		img.src = src;

		return () => {
			current.removeChild(canvas);
		};
	}, [src, visualizationWidth]);

	return <div ref={ref} style={containerStyle} />;
};
