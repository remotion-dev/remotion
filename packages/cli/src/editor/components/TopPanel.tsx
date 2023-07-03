import React, {useCallback, useContext, useMemo} from 'react';
import {useBreakpoint} from '../helpers/use-breakpoint';
import {SidebarContext} from '../state/sidebar';
import {CanvasOrLoading} from './CanvasOrLoading';
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

export const useResponsiveSidebarStatus = (): 'collapsed' | 'expanded' => {
	const {sidebarCollapsedStateLeft} = useContext(SidebarContext);
	const responsiveLeftStatus = useBreakpoint(1200) ? 'collapsed' : 'expanded';

	const actualStateLeft = useMemo((): 'expanded' | 'collapsed' => {
		if (sidebarCollapsedStateLeft === 'collapsed') {
			return 'collapsed';
		}

		if (sidebarCollapsedStateLeft === 'expanded') {
			return 'expanded';
		}

		return responsiveLeftStatus;
	}, [sidebarCollapsedStateLeft, responsiveLeftStatus]);

	return actualStateLeft;
};

export const TopPanel: React.FC = () => {
	const {setSidebarCollapsedState, sidebarCollapsedStateRight} =
		useContext(SidebarContext);

	const actualStateLeft = useResponsiveSidebarStatus();

	const actualStateRight = useMemo((): 'expanded' | 'collapsed' => {
		if (sidebarCollapsedStateRight === 'collapsed') {
			return 'collapsed';
		}

		return 'expanded';
	}, [sidebarCollapsedStateRight]);

	const onCollapseLeft = useCallback(() => {
		setSidebarCollapsedState({left: 'collapsed', right: null});
	}, [setSidebarCollapsedState]);

	const onCollapseRight = useCallback(() => {
		setSidebarCollapsedState({left: null, right: 'collapsed'});
	}, [setSidebarCollapsedState]);

	return (
		<div style={container}>
			<InitialCompositionLoader />
			<MenuToolbar />
			<div style={row}>
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
							maxFlex={0.8}
							defaultFlex={0.7}
							id="canvas-to-right-sidebar"
							orientation="vertical"
						>
							<SplitterElement type="flexer">
								<div style={canvasContainer}>
									<CanvasOrLoading />
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
					</SplitterElement>
				</SplitterContainer>
			</div>
			<PreviewToolbar />
			<CurrentCompositionKeybindings />
			<TitleUpdater />
		</div>
	);
};
