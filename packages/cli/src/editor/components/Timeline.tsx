import React from 'react';
import styled from 'styled-components';
import {FpsCounter} from './FpsCounter';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineElements} from './TimelineElements';
import {TimelineSlider} from './TimelineSlider';
import {TimeValue} from './TimeValue';

const TimelineContainer = styled.div`
	overflow-y: auto;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
`;

const Row = styled.div`
	padding: 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Timeline: React.FC = () => (
	<Header>
		<Row>
			<TimeValue />
			<FpsCounter />
		</Row>
		<TimelineDragHandler>
			<TimelineContainer>
				<TimelineElements />
			</TimelineContainer>
			<TimelineSlider />
		</TimelineDragHandler>
	</Header>
);
