import React, {useCallback, useState} from 'react';
import {Canvas} from './Canvas';
import {CollapsedCompositionSelector} from './CollapsedCompositionSelector';
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
	const [leftSidebarCollapsed, setCollapsed] = useState(false);

	const onCollapse = useCallback(() => {
		setCollapsed(true);
	}, []);

	const onExpand = useCallback(() => {
		setCollapsed(false);
	}, []);

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
					{leftSidebarCollapsed ? (
						<CollapsedCompositionSelector onExpand={onExpand} />
					) : (
						<>
							<SplitterElement type="flexer">
								<div style={leftContainer} className="css-reset">
									<CompositionSelector />
								</div>
							</SplitterElement>
							<SplitterHandle allowToCollapse onCollapse={onCollapse} />
						</>
					)}
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
