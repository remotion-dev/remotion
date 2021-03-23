import React from 'react';
import styled from 'styled-components';
import {Canvas} from './Canvas';
import {CompositionSelector} from './CompositionSelector';
import {PreviewToolbar} from './PreviewToolbar';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';

export const Container = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	flex: 1;
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
	display: flex;
`;

export const TopPanel: React.FC = () => {
	return (
		<Container>
			<Row>
				<SplitterContainer
					minFlex={0.15}
					maxFlex={0.4}
					defaultFlex={0.2}
					id="sidebar-to-preview"
					orientation="vertical"
				>
					<SplitterElement type="flexer">
						<LeftContainer>
							<CompositionSelector />
						</LeftContainer>
					</SplitterElement>
					<SplitterHandle />
					<SplitterElement type="anti-flexer">
						<CanvasContainer>
							<Canvas />
						</CanvasContainer>
					</SplitterElement>
				</SplitterContainer>
			</Row>
			<PreviewToolbar />
		</Container>
	);
};
