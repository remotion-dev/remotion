import React from 'react';
import styled from 'styled-components';
import {FpsCounter} from './FpsCounter';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineElements} from './TimelineElements';
import {TimelineSlider} from './TimelineSlider';
import {TimeValue} from './TimeValue';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
`;

const Details = styled.div`
	padding: 12px 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Timeline: React.FC = () => (
	<Container>
		<Details>
			<TimeValue />
			<FpsCounter />
		</Details>
		<TimelineDragHandler>
			<TimelineElements />
			<TimelineSlider />
		</TimelineDragHandler>
	</Container>
);
