import React from 'react';
import styled from 'styled-components';
import {TimelineElements} from './Timeline/TimelineElements';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	flex: 1;
	min-height: 200px;
`;

export const Timeline: React.FC = () => (
	<Container>
		<TimelineElements />
	</Container>
);
