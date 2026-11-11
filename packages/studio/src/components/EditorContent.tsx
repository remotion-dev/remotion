import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {BORDER_BLACK} from '../helpers/colors';
import {AudioLevelsContext} from '../state/audio-levels';
import {Transform3DModeStateProvider} from '../state/transform-3d-mode';
import {AudioLevels} from './AudioLevels';
import {Diagnostics} from './Diagnostics';
import {GlobalKeybindings} from './GlobalKeybindings';
import {InitialCompositionLoader} from './InitialCompositionLoader';
import {MenuToolbar} from './MenuToolbar';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';
import {SplitterImperativeProvider} from './Splitter/SplitterImperativeContext';
import {shouldClearSelectionOnPointerDown} from './Timeline/should-clear-selection-on-pointer-down';
import {Timeline} from './Timeline/Timeline';
import {TimelineEmptyState} from './Timeline/TimelineEmptyState';
import {TimelineKeyframeDragStateProvider} from './Timeline/TimelineKeyframeDragState';
import {
	TimelineSelectionProvider,
	useCurrentTimelineSelectionStateAsRef,
} from './Timeline/TimelineSelection';
import {TimelineTickFormatProvider} from './Timeline/TimelineTickFormatProvider';
import {WebMcp} from './WebMcp';

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
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!shouldClearSelectionOnPointerDown(e)) {
				return;
			}

			currentSelection.current.clearSelection();
		},
		[currentSelection],
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
	const {visible: audioLevelsVisible} = useContext(AudioLevelsContext);
	const {canvasContent, currentAssetMetadata} = useContext(
		Internals.CompositionManager,
	);

	const showTimeline =
		canvasContent !== null &&
		(canvasContent.type === 'composition' ||
			(canvasContent.type === 'asset' &&
				currentAssetMetadata?.asset === canvasContent.asset));

	const content = (
		<SplitterContainer
			orientation="horizontal"
			id="top-to-bottom"
			maxFlex={0.9}
			minFlex={0.2}
			defaultFlex={0.75}
			maxFlexerSize={null}
			minFlexerSize={null}
			maxAntiFlexerSize={null}
			minAntiFlexerSize={null}
		>
			<SplitterElement sticky={null} type="flexer">
				{children}
			</SplitterElement>
			<SplitterHandle
				label="Preview height"
				allowToCollapse="none"
				onCollapse={noop}
				onCollapseDuringDrag={null}
			/>
			<SplitterElement sticky={null} type="anti-flexer">
				<div style={{display: 'flex', flex: 1, minHeight: 0}}>
					<div
						role="region"
						aria-label="Timeline"
						style={{
							display: 'flex',
							flexDirection: 'column',
							flex: 1,
							minWidth: 0,
							position: 'relative',
							overflow: 'hidden',
							borderRight: audioLevelsVisible ? BORDER_BLACK : undefined,
						}}
					>
						{showTimeline ? <Timeline /> : <TimelineEmptyState />}
					</div>
					{audioLevelsVisible ? <AudioLevels /> : null}
				</div>
			</SplitterElement>
		</SplitterContainer>
	);

	return (
		<TimelineTickFormatProvider>
			<TimelineSelectionProvider>
				<SplitterImperativeProvider>
					<WebMcp />
					<Diagnostics />
					<Transform3DModeStateProvider>
						<StudioClearSelectionArea>
							<InitialCompositionLoader />
							<MenuToolbar readOnlyStudio={readOnlyStudio} />
							<GlobalKeybindings />
							<TimelineKeyframeDragStateProvider>
								{content}
							</TimelineKeyframeDragStateProvider>
						</StudioClearSelectionArea>
					</Transform3DModeStateProvider>
				</SplitterImperativeProvider>
			</TimelineSelectionProvider>
		</TimelineTickFormatProvider>
	);
};
