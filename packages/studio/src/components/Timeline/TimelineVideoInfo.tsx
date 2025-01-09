import type {VideoMetadata} from '@remotion/media-utils';
import {getVideoMetadata} from '@remotion/media-utils';
import React, {useEffect, useRef, useState} from 'react';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';

const containerStyle: React.CSSProperties = {
	height: TIMELINE_LAYER_HEIGHT - 2,
	width: TIMELINE_LAYER_HEIGHT - 2,
	backgroundColor: 'rgba(0, 0, 0, 0.3)',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
	borderTopLeftRadius: 2,
	borderBottomLeftRadius: 2,
	fontSize: 10,
	fontFamily: 'Arial, Helvetica',
};

const svgStyle: React.CSSProperties = {
	height: 12,
};

const pathStyle: React.CSSProperties = {
	color: '#8e44ad',
};

export const TimelineVideoInfo: React.FC<{
	readonly src: string;
}> = ({src}) => {
	const mountState = useRef({isMounted: true});
	const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
		null,
	);

	useEffect(() => {
		getVideoMetadata(src)
			.then((data) => {
				setVideoMetadata(data);
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.log('Could not get video metadata', err);
			});
	}, [src]);

	useEffect(() => {
		const {current} = mountState;
		current.isMounted = true;
		return () => {
			current.isMounted = false;
		};
	}, []);

	if (!videoMetadata) {
		return null;
	}

	return (
		<div style={containerStyle}>
			<svg style={svgStyle} role="img" viewBox="0 0 576 512">
				<path
					style={pathStyle}
					fill="currentColor"
					d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z"
				/>
			</svg>
		</div>
	);
};
