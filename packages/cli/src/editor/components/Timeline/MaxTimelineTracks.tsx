import React from 'react';
import styled from 'styled-components';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';

export const MAX_TIMELINE_TRACKS = 15;

const Container = styled.div`
	padding-top: 6px;
	padding-bottom: 6px;
	color: rgba(255, 255, 255, 0.6);
	font-family: sans-serif;
	font-size: 12px;
	background-color: rgba(255, 255, 255, 0.1);
	padding-left: ${TIMELINE_PADDING + 5}px;
`;

export const MaxTimelineTracksReached: React.FC = () => {
	return (
		<Container>
			Limited display to {MAX_TIMELINE_TRACKS} tracks to sustain performance.
		</Container>
	);
};
