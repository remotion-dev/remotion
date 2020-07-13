import React from 'react';
import styled from 'styled-components';
import {TopPanel} from './TopPanel';
import {Timeline} from './Timeline';

const Background = styled.div`
	background: #222;
	display: flex;
	width: 100%;
	height: 100%;
	flex-direction: column;
	position: absolute;
`;

export const Editor: React.FC = () => {
	return (
		<Background>
			<TopPanel />
			<Timeline />
		</Background>
	);
};
