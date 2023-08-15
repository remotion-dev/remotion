import React from 'react';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';

export const DEFAULT_TIMELINE_TRACKS = 90;

export const MAX_TIMELINE_TRACKS =
	typeof process.env.MAX_TIMELINE_TRACKS === 'undefined'
		? DEFAULT_TIMELINE_TRACKS
		: Number(process.env.MAX_TIMELINE_TRACKS);

export const MAX_TIMELINE_TRACKS_NOTICE_HEIGHT = 24;

const container: React.CSSProperties = {
	height: MAX_TIMELINE_TRACKS_NOTICE_HEIGHT,
	display: 'flex',
	alignItems: 'center',
	color: 'rgba(255, 255, 255, 0.6)',
	fontFamily: 'sans-serif',
	fontSize: 12,
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	paddingLeft: TIMELINE_PADDING + 5,
};

export const MaxTimelineTracksReached: React.FC = () => {
	return (
		<div style={container}>
			Limited display to {MAX_TIMELINE_TRACKS} tracks to sustain performance.
			{''}
			You can change this by setting Config.setMaxTimelineTracks() in your
			remotion.config.ts file.
		</div>
	);
};
