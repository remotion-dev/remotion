import React from 'react';
import styled from 'styled-components';
import {Canvas} from './Canvas';
import {CompositionSelector} from './CompositionSelector';
import {PreviewToolbar} from './PreviewToolbar';

export const Container = styled.div`
	flex: 2;
	border-bottom: 3px solid black;
	display: flex;
	flex-direction: column;
`;

const Row = styled.div`
	display: flex;
	flex-direction: row;
	flex: 1;
`;

const CanvasContainer = styled.div`
	flex: 1;
	display: flex;
`;

const LeftContainer = styled.div`
	width: 300px;
	display: flex;
	position: relative;
`;

export const TopPanel: React.FC = () => {
	return (
		<Container>
			<Row>
				<LeftContainer>
					<CompositionSelector />
				</LeftContainer>
				<CanvasContainer>
					<Canvas />
				</CanvasContainer>
			</Row>
			<PreviewToolbar />
		</Container>
	);
};
