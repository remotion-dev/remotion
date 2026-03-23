import React, {useContext} from 'react';
import {Internals} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {InitialCompositionLoader} from './InitialCompositionLoader';
import {MenuToolbar} from './MenuToolbar';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';
import {Timeline} from './Timeline/Timeline';
import {TimelineEmptyState} from './Timeline/TimelineEmptyState';

const noop = () => undefined;

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	height: 0,
};

export const EditorContent: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly children: React.ReactNode;
}> = ({readOnlyStudio, children}) => {
	const isStill = useIsStill();
	const {canvasContent} = useContext(Internals.CompositionManager);

	const showTimeline =
		canvasContent !== null && !isStill && canvasContent.type === 'composition';

	return (
		<div style={container}>
			<InitialCompositionLoader />
			<MenuToolbar readOnlyStudio={readOnlyStudio} />
			<SplitterContainer
				orientation="horizontal"
				id="top-to-bottom"
				maxFlex={0.9}
				minFlex={0.2}
				defaultFlex={0.75}
			>
				<SplitterElement sticky={null} type="flexer">
					{children}
				</SplitterElement>
				<SplitterHandle allowToCollapse="none" onCollapse={noop} />
				<SplitterElement sticky={null} type="anti-flexer">
					{showTimeline ? <Timeline /> : <TimelineEmptyState />}
				</SplitterElement>
			</SplitterContainer>
		</div>
	);
};
