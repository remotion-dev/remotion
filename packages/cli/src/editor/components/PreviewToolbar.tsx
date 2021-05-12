import React from 'react';
import styled from 'styled-components';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';
import {CheckboardToggle} from './CheckboardToggle';
import {FpsCounter} from './FpsCounter';
import {MediaVolumeSlider} from './MediaVolumeSlider';
import {PlayPause} from './PlayPause';
import {RichTimelineToggle} from './RichTimelineToggle';
import {SizeSelector} from './SizeSelector';
import {TimeValue} from './TimeValue';

const Container = styled.div`
	display: flex;
	justify-content: center;
	border-top: 1px solid rgba(0, 0, 0, 0.5);
	padding-top: 2px;
	padding-bottom: 2px;
	align-items: center;
	flex-direction: row;
`;

const SideContainer = styled.div`
	width: 300px;
	height: 38px;
	display: flex;
	flex-direction: row;
	align-items: center;
`;

const Flex = styled.div`
	flex: 1;
`;

const Padding = styled.div`
	width: ${TIMELINE_PADDING}px;
`;

export const PreviewToolbar: React.FC = () => {
	return (
		<Container>
			<SideContainer>
				<Padding />
				<TimeValue />
			</SideContainer>
			<Flex />
			<SizeSelector />
			<PlayPause />
			<CheckboardToggle />
			<RichTimelineToggle />
			<MediaVolumeSlider />
			<Flex />
			<SideContainer>
				<Flex />
				<FpsCounter />
				<Padding />
			</SideContainer>
		</Container>
	);
};
