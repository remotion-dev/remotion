import React from 'react';
import {Canvas} from './Canvas';
import {CompositionSelector} from './CompositionSelector';
import {MenuToolbar} from './MenuToolbar';
import {PreviewToolbar} from './PreviewToolbar';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';

const container: React.CSSProperties = {
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	flex: 1,
};

const canvasContainer: React.CSSProperties = {
	flex: 1,
	display: 'flex',
};

const leftContainer: React.CSSProperties = {
	flex: 1,
	display: 'flex',
};

export const TopPanel: React.FC = () => {
	return (
		<div style={container}>
			<MenuToolbar />
			<div style={row}>
				<SplitterContainer
					minFlex={0.15}
					maxFlex={0.4}
					defaultFlex={0.2}
					id="sidebar-to-preview"
					orientation="vertical"
				>
					<SplitterElement type="flexer">
						<div style={leftContainer}>
							<CompositionSelector />
						</div>
					</SplitterElement>
					<SplitterHandle />
					<SplitterElement type="anti-flexer">
						<div style={canvasContainer}>
							<Canvas />
						</div>
					</SplitterElement>
				</SplitterContainer>
			</div>
			<PreviewToolbar />
		</div>
	);
};
