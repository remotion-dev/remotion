import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {GlobalKeybindings} from './GlobalKeybindings';
import {InitialCompositionLoader} from './InitialCompositionLoader';
import {MenuToolbar} from './MenuToolbar';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';
import {shouldClearSelectionOnPointerDown} from './Timeline/should-clear-selection-on-pointer-down';
import {Timeline} from './Timeline/Timeline';
import {TimelineEmptyState} from './Timeline/TimelineEmptyState';
import {TimelineKeyframeDragStateProvider} from './Timeline/TimelineKeyframeDragState';
import {
	TimelineSelectionProvider,
	useTimelineSelection,
} from './Timeline/TimelineSelection';

const noop = () => undefined;

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	height: 0,
};

const StudioClearSelectionArea: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {clearSelection} = useTimelineSelection();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!shouldClearSelectionOnPointerDown(e)) {
				return;
			}

			clearSelection();
		},
		[clearSelection],
	);

	return (
		<div style={container} onPointerDown={onPointerDown}>
			{children}
		</div>
	);
};

export const EditorContent: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly children: React.ReactNode;
}> = ({readOnlyStudio, children}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);

	const showTimeline =
		canvasContent !== null && canvasContent.type === 'composition';

	const content = (
		<SplitterContainer
			orientation="horizontal"
			id="top-to-bottom"
			maxFlex={0.9}
			minFlex={0.2}
			defaultFlex={0.75}
			maxFlexerSize={null}
			maxAntiFlexerSize={null}
		>
			<SplitterElement sticky={null} type="flexer">
				{children}
			</SplitterElement>
			<SplitterHandle allowToCollapse="none" onCollapse={noop} />
			<SplitterElement sticky={null} type="anti-flexer">
				{showTimeline ? <Timeline /> : <TimelineEmptyState />}
			</SplitterElement>
		</SplitterContainer>
	);

	return (
		<TimelineSelectionProvider>
			<StudioClearSelectionArea>
				<InitialCompositionLoader />
				<MenuToolbar readOnlyStudio={readOnlyStudio} />
				<GlobalKeybindings />
				<TimelineKeyframeDragStateProvider>
					{content}
				</TimelineKeyframeDragStateProvider>
			</StudioClearSelectionArea>
		</TimelineSelectionProvider>
	);
};
