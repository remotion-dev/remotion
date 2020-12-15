import React from 'react';
import styled from 'styled-components';
import {FpsCounter} from './FpsCounter';
import {TimelineSlider} from './TimelineSlider';
import {TimeValue} from './TimeValue';

export const TimelineContainer = styled.div`
	flex: 1;
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
		<TimelineContainer>
			<Header>
				<Row>
					<TimeValue />
					<div style={{flex: 1}} />
					<FpsCounter />
				</Row>
				<TimelineSlider />
			</Header>
		</TimelineContainer>
	);
};
