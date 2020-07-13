import React from 'react';
import styled from 'styled-components';
import {TimelineSlider} from './TimelineSlider';

export const TimelineContainer = styled.div`
	flex: 1;
`;

export const Timeline: React.FC = () => {
	return (
		<TimelineContainer>
			<TimelineSlider />
		</TimelineContainer>
	);
};
