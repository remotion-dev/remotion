import React from 'react';
import styled from 'styled-components';
import {FpsCounter} from './FpsCounter';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineElements} from './TimelineElements';
import {TimelineSlider} from './TimelineSlider';
import {TimeValue} from './TimeValue';

const OuterContainer = styled.div``;

const TimelineContainer = styled.div`
	overflow-y: auto;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
`;

const Row = styled.div`
	flex-direction: row;
	display: flex;
	align-items: center;
	flex: 1;
`;

export const Timeline: React.FC = () => {
	return (
		<OuterContainer>
			<Header>
				<Row style={{padding: 10}}>
					<TimeValue />
					<div style={{flex: 1}} />
					<FpsCounter />
				</Row>
				<TimelineDragHandler>
					<TimelineContainer>
						<TimelineElements />
					</TimelineContainer>
					<TimelineSlider />
				</TimelineDragHandler>
			</Header>
		</OuterContainer>
	);
};
