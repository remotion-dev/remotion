import React from 'react';
import styled from 'styled-components';
import {TimelineSlider} from './TimelineSlider';
import {TimeValue} from './TimeValue';

export const TimelineContainer = styled.div`
	flex: 1;
`;
const Header = styled.div`
	display: flex;
	flex-direction: row;
`;

export const Timeline: React.FC = () => {
	return (
		<TimelineContainer>
			<Header>
				<TimeValue />
				<TimelineSlider />
			</Header>
		</TimelineContainer>
	);
};
