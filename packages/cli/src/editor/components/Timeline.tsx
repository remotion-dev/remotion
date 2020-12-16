import React from 'react';
import styled from 'styled-components';
import {FpsCounter} from './FpsCounter';
import {TimelineElements} from './TimelineElements';
import {TimelineSlider} from './TimelineSlider';
import {TimeValue} from './TimeValue';

export const OuterContainer = styled.div`
	flex: 1;
	max-height: 300px;
	overflow-y: auto;
`;

const TimelineContainer = styled.div`
	max-height: 300px;
	overflow-y: auto;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
	padding: 10px;
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
				<Row>
					<TimeValue />
					<div style={{flex: 1}} />
					<FpsCounter />
				</Row>
				<TimelineSlider />
				<TimelineContainer>
					<TimelineElements />
				</TimelineContainer>
			</Header>
		</OuterContainer>
	);
};
