import {useElementSize} from '@remotion/player/src/utils/use-element-size';
import React, {createRef, useCallback, useMemo, useState} from 'react';
import {Canvas} from './Canvas';
import {CollapsedCompositionSelector} from './CollapsedCompositionSelector';
import {CompositionSelector} from './CompositionSelector';
import {InitialCompositionLoader} from './InitialCompositionLoader';
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

const storageKey = 'remotion.sidebarCollapsing';

type CollapsedState = 'collapsed' | 'expanded' | 'responsive';

export const getSavedCollapsedState = (): CollapsedState => {
	const state = window.localStorage.getItem(storageKey);
	if (state === 'collapsed') {
		return 'collapsed';
	}

	if (state === 'expanded') {
		return 'expanded';
	}

	return 'responsive';
};

export const setSavedCollapsedState = (type: CollapsedState) => {
	window.localStorage.setItem(storageKey, type);
};

const bodyRef = createRef<HTMLElement>();

// @ts-expect-error
bodyRef.current = document.body;

export const TopPanel: React.FC = () => {
	const [leftSidebarCollapsedState, setCollapsedState] = useState(() =>
		getSavedCollapsedState()
	);

	const windowSize = useElementSize(bodyRef, {
		shouldApplyCssTransforms: false,
		triggerOnWindowResize: false,
	});

	const actualState = useMemo((): 'expanded' | 'collapsed' => {
		if (leftSidebarCollapsedState === 'collapsed') {
			return 'collapsed';
		}

		if (leftSidebarCollapsedState === 'expanded') {
			return 'expanded';
		}

		if (!windowSize) {
			return 'collapsed';
		}

		return windowSize.width < 1200 ? 'collapsed' : 'expanded';
	}, [leftSidebarCollapsedState, windowSize]);

	const onCollapse = useCallback(() => {
		setCollapsedState('collapsed');
		setSavedCollapsedState('collapsed');
	}, []);

	const onExpand = useCallback(() => {
		setCollapsedState('expanded');
		setSavedCollapsedState('expanded');
	}, []);

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
								<CompositionSelector />
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
