import React from 'react';
import {WHITE_ALPHA_10, WHITE_ALPHA_60} from '../../helpers/colors';
import {getStudioMaxTimelineTracks} from '../../helpers/studio-runtime-config';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';

export const MAX_TIMELINE_TRACKS = getStudioMaxTimelineTracks();

export const MAX_TIMELINE_TRACKS_NOTICE_HEIGHT = 24;

const container: React.CSSProperties = {
	height: MAX_TIMELINE_TRACKS_NOTICE_HEIGHT,
	display: 'flex',
	alignItems: 'center',
	color: WHITE_ALPHA_60,
	fontFamily: 'sans-serif',
	fontSize: 12,
	backgroundColor: WHITE_ALPHA_10,
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
