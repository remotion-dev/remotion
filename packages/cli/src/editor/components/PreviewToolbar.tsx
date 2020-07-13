import React from 'react';
import styled from 'styled-components';
import {SizeSelector} from './SizeSelector';
import {PlayPause} from './PlayPause';

const Container = styled.div`
	display: flex;
	justify-content: center;
	border-top: 1px solid rgba(0, 0, 0, 0.5);
	padding-top: 2px;
	padding-bottom: 2px;
`;

export const PreviewToolbar: React.FC = () => {
	return (
		<Container>
			<SizeSelector />
			<PlayPause />
		</Container>
	);
};
