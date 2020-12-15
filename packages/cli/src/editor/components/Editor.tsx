import React from 'react';
import {getRoot} from 'remotion';
import styled from 'styled-components';
import {Timeline} from './Timeline';
import {TopPanel} from './TopPanel';

const Background = styled.div`
	background: #222;
	display: flex;
	width: 100%;
	height: 100%;
	flex-direction: column;
	position: absolute;
`;

const Root = getRoot();

export const Editor: React.FC = () => {
	if (!Root) {
		throw new Error('Root has not been registered. ');
	}
	return (
		<Background>
			<Root />
			<TopPanel />
			<Timeline />
		</Background>
	);
};
