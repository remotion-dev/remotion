import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {Internals} from 'remotion';
import {useMobileLayout} from '../helpers/mobile-layout';
import {useBreakpoint} from '../helpers/use-breakpoint';
import {RULER_WIDTH} from '../state/editor-rulers';
import {SidebarContext} from '../state/sidebar';
import {CanvasIfSizeIsAvailable} from './CanvasIfSizeIsAvailable';
import {TitleUpdater} from './CurrentCompositionSideEffects';
import {useIsRulerVisible} from './EditorRuler/use-is-ruler-visible';
import {ExplorerPanel} from './ExplorerPanel';
import {ObserveDefaultProps} from './ObserveDefaultPropsContext';
import {OptionsPanel} from './OptionsPanel';
import {PreviewToolbar} from './PreviewToolbar';
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
	minHeight: 0,
};

const MAX_SIDEBAR_WIDTH = 350;
const MIN_SIDEBAR_WIDTH = 250;

export const useResponsiveSidebarStatus = (): 'collapsed' | 'expanded' => {
	const {sidebarCollapsedStateLeft} = useContext(SidebarContext);
	const isMobileLayout = useMobileLayout();
	const responsiveLeftStatus = useBreakpoint(1200) ? 'collapsed' : 'expanded';

	const actualStateLeft = useMemo((): 'expanded' | 'collapsed' => {
		if (isMobileLayout) {
			return 'collapsed';
		}

		if (sidebarCollapsedStateLeft === 'collapsed') {
			return 'collapsed';
		}

		if (sidebarCollapsedStateLeft === 'expanded') {
			return 'expanded';
		}

		return responsiveLeftStatus;
	}, [isMobileLayout, sidebarCollapsedStateLeft, responsiveLeftStatus]);

	return actualStateLeft;
};

const TopPanelInner: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly onMounted: () => void;
	readonly drawRef: React.Ref<HTMLDivElement>;
	readonly bufferStateDelayInMilliseconds: number;
}> = ({readOnlyStudio, onMounted, drawRef, bufferStateDelayInMilliseconds}) => {
	const {setSidebarCollapsedState, sidebarCollapsedStateRight} =
		useContext(SidebarContext);
	const rulersAreVisible = useIsRulerVisible();

	const {canvasContent} = useContext(Internals.CompositionManager);

	const actualStateLeft = useResponsiveSidebarStatus();

	const actualStateRight = useMemo((): 'expanded' | 'collapsed' => {
		if (sidebarCollapsedStateRight === 'collapsed') {
			return 'collapsed';
		}

		return 'expanded';
	}, [sidebarCollapsedStateRight]);
	const previousSidebarState = useRef({
		left: actualStateLeft,
		right: actualStateRight,
	});

	useLayoutEffect(() => {
		if (
			previousSidebarState.current.left === actualStateLeft &&
			previousSidebarState.current.right === actualStateRight
		) {
			return;
		}

		previousSidebarState.current = {
			left: actualStateLeft,
			right: actualStateRight,
		};
		PlayerInternals.updateAllElementsSizes();
	}, [actualStateLeft, actualStateRight]);

	useEffect(() => {
		onMounted();
	}, [onMounted]);

	const canvasContainerStyle: React.CSSProperties = useMemo(
		() => ({
			flex: 1,
			display: 'flex',
			paddingTop: rulersAreVisible ? RULER_WIDTH : 0,
			paddingLeft: rulersAreVisible ? RULER_WIDTH : 0,
		}),
		[rulersAreVisible],
	);

	const onCollapseLeft = useCallback(() => {
		setSidebarCollapsedState({left: 'collapsed', right: null});
	}, [setSidebarCollapsedState]);

	const onCollapseRight = useCallback(() => {
		setSidebarCollapsedState({left: null, right: 'collapsed'});
	}, [setSidebarCollapsedState]);

	return (
		<ObserveDefaultProps
			compositionId={
				canvasContent?.type === 'composition'
					? canvasContent.compositionId
					: null
			}
			readOnlyStudio={readOnlyStudio}
		>
			<div style={container}>
				<div style={row}>
					<SplitterContainer
						minFlex={0.15}
						maxFlex={0.4}
						defaultFlex={0.2}
						maxFlexerSize={MAX_SIDEBAR_WIDTH}
						minFlexerSize={null}
						maxAntiFlexerSize={null}
						minAntiFlexerSize={null}
						id="sidebar-to-preview"
						orientation="vertical"
					>
						{actualStateLeft === 'expanded' ? (
							<SplitterElement sticky={null} type="flexer">
								<ExplorerPanel readOnlyStudio={readOnlyStudio} />
							</SplitterElement>
						) : null}
						{actualStateLeft === 'expanded' ? (
							<SplitterHandle
								allowToCollapse="left"
								onCollapse={onCollapseLeft}
							/>
						) : null}
						<SplitterElement sticky={null} type="anti-flexer">
							<SplitterContainer
								minFlex={0.5}
								maxFlex={0.8}
								defaultFlex={0.7}
								maxFlexerSize={null}
								minFlexerSize={null}
								maxAntiFlexerSize={MAX_SIDEBAR_WIDTH}
								minAntiFlexerSize={MIN_SIDEBAR_WIDTH}
								id="canvas-to-right-sidebar"
								orientation="vertical"
							>
								<SplitterElement sticky={null} type="flexer">
									<div ref={drawRef} style={canvasContainerStyle}>
										<CanvasIfSizeIsAvailable />
									</div>
								</SplitterElement>
								{actualStateRight === 'expanded' ? (
									<SplitterHandle
										allowToCollapse="right"
										onCollapse={onCollapseRight}
									/>
								) : null}
								{actualStateRight === 'expanded' ? (
									<SplitterElement sticky={null} type="anti-flexer">
										<OptionsPanel readOnlyStudio={readOnlyStudio} />
									</SplitterElement>
								) : null}
							</SplitterContainer>
						</SplitterElement>
					</SplitterContainer>
				</div>
				<PreviewToolbar
					bufferStateDelayInMilliseconds={bufferStateDelayInMilliseconds}
					readOnlyStudio={readOnlyStudio}
				/>
				<TitleUpdater />
			</div>
		</ObserveDefaultProps>
	);
};

export const TopPanel = React.memo(TopPanelInner);
