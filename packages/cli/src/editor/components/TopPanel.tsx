import React, {useCallback, useContext, useMemo} from 'react';
import {useCompactUI} from '../helpers/use-compact-ui';
import {SidebarContext} from '../state/sidebar';
import {Canvas} from './Canvas';
import {CollapsedCompositionSelector} from './CollapsedCompositionSelector';
import {InitialCompositionLoader} from './InitialCompositionLoader';
import {MenuToolbar} from './MenuToolbar';
import {PreviewToolbar} from './PreviewToolbar';
import {SidebarContent} from './SidebarContent';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';

const container: React.CSSProperties = {
	height: '100%',
	width: '100%',
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
	const compactUi = useCompactUI();
	const {setSidebarCollapsedState, sidebarCollapsedState} =
		useContext(SidebarContext);

	const actualState = useMemo((): 'expanded' | 'collapsed' => {
		if (sidebarCollapsedState === 'collapsed') {
			return 'collapsed';
		}

		if (sidebarCollapsedState === 'expanded') {
			return 'expanded';
		}

		return compactUi ? 'collapsed' : 'expanded';
	}, [compactUi, sidebarCollapsedState]);

	const onCollapse = useCallback(() => {
		setSidebarCollapsedState('collapsed');
	}, [setSidebarCollapsedState]);

	const onExpand = useCallback(() => {
		setSidebarCollapsedState('expanded');
	}, [setSidebarCollapsedState]);

	return (
		<div style={container}>
			<InitialCompositionLoader />
			<MenuToolbar />
			<div style={row}>
				{actualState === 'collapsed' ? (
					<CollapsedCompositionSelector onExpand={onExpand} />
				) : null}
				<SplitterContainer
					minFlex={0.15}
					maxFlex={0.4}
					defaultFlex={0.2}
					id="sidebar-to-preview"
					orientation="vertical"
				>
					{actualState === 'expanded' ? (
						<SplitterElement type="flexer">
							<div style={leftContainer} className="css-reset">
								<SidebarContent />
							</div>
						</SplitterElement>
					) : null}
					{actualState === 'expanded' ? (
						<SplitterHandle allowToCollapse onCollapse={onCollapse} />
					) : null}
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
