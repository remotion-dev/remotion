import React, {useCallback, useContext, useMemo} from 'react';
import {useBreakpoint} from '../helpers/use-breakpoint';
import {SidebarContext} from '../state/sidebar';
import {Canvas} from './Canvas';
import {CollapsedSidebarExpander} from './CollapsedSidebarExpander';
import {CompositionSelector} from './CompositionSelector';
import {
	CurrentCompositionKeybindings,
	TitleUpdater,
} from './CurrentCompositionSideEffects';
import {InitialCompositionLoader} from './InitialCompositionLoader';
import {MenuToolbar} from './MenuToolbar';
import {PreviewToolbar} from './PreviewToolbar';
import {RightPanel} from './RightPanel';
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
	maxWidth: '100%',
};

export const TopPanel: React.FC = () => {
	const leftSidebarBreakpoint = useBreakpoint(1200);
	const rightSidebarBreakpoint = useBreakpoint(1600);
	const {
		setSidebarCollapsedStateLeft,
		sidebarCollapsedStateLeft,
		setSidebarCollapsedStateRight,
		sidebarCollapsedStateRight,
	} = useContext(SidebarContext);

	const actualStateLeft = useMemo((): 'expanded' | 'collapsed' => {
		if (sidebarCollapsedStateLeft === 'collapsed') {
			return 'collapsed';
		}

		if (sidebarCollapsedStateLeft === 'expanded') {
			return 'expanded';
		}

		return leftSidebarBreakpoint ? 'collapsed' : 'expanded';
	}, [leftSidebarBreakpoint, sidebarCollapsedStateLeft]);

	const actualStateRight = useMemo((): 'expanded' | 'collapsed' => {
		if (sidebarCollapsedStateRight === 'collapsed') {
			return 'collapsed';
		}

		if (sidebarCollapsedStateRight === 'expanded') {
			return 'expanded';
		}

		return rightSidebarBreakpoint ? 'collapsed' : 'expanded';
	}, [rightSidebarBreakpoint, sidebarCollapsedStateRight]);

	const onCollapseLeft = useCallback(() => {
		setSidebarCollapsedStateLeft('collapsed');
	}, [setSidebarCollapsedStateLeft]);

	const onExpandLeft = useCallback(() => {
		setSidebarCollapsedStateLeft('expanded');
	}, [setSidebarCollapsedStateLeft]);

	const onCollapseRight = useCallback(() => {
		setSidebarCollapsedStateRight('collapsed');
	}, [setSidebarCollapsedStateRight]);

	const onExpandRight = useCallback(() => {
		setSidebarCollapsedStateRight('expanded');
	}, [setSidebarCollapsedStateRight]);

	return (
		<div style={container}>
			<InitialCompositionLoader />
			<MenuToolbar />
			<div style={row}>
				{actualStateLeft === 'collapsed' ? (
					<CollapsedSidebarExpander direction="right" onExpand={onExpandLeft} />
				) : null}
				<SplitterContainer
					minFlex={0.15}
					maxFlex={0.4}
					defaultFlex={0.2}
					id="sidebar-to-preview"
					orientation="vertical"
				>
					{actualStateLeft === 'expanded' ? (
						<SplitterElement type="flexer">
							<div style={leftContainer} className="css-reset">
								<CompositionSelector />
							</div>
						</SplitterElement>
					) : null}
					{actualStateLeft === 'expanded' ? (
						<SplitterHandle
							allowToCollapse="left"
							onCollapse={onCollapseLeft}
						/>
					) : null}
					<SplitterElement type="anti-flexer">
						<SplitterContainer
							minFlex={0.5}
							maxFlex={0.75}
							defaultFlex={0.7}
							id="canvas-to-right-sidebar"
							orientation="vertical"
						>
							<SplitterElement type="flexer">
								<div style={canvasContainer}>
									<Canvas />
								</div>
							</SplitterElement>
							{actualStateRight === 'expanded' ? (
								<SplitterHandle
									allowToCollapse="right"
									onCollapse={onCollapseRight}
								/>
							) : null}
							{actualStateRight === 'expanded' ? (
								<SplitterElement type="anti-flexer">
									<RightPanel />
								</SplitterElement>
							) : null}
						</SplitterContainer>
						{actualStateRight === 'collapsed' ? (
							<CollapsedSidebarExpander
								direction="left"
								onExpand={onExpandRight}
							/>
						) : null}
					</SplitterElement>
				</SplitterContainer>
			</div>
			<PreviewToolbar />
			<CurrentCompositionKeybindings />
			<TitleUpdater />
		</div>
	);
};
