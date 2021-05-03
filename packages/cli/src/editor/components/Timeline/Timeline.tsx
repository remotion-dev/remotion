import React, {useContext, useMemo, useReducer} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
} from '../../helpers/timeline-layout';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {isTrackHidden} from './is-collapsed';
import {MAX_TIMELINE_TRACKS} from './MaxTimelineTracks';
import {timelineStateReducer} from './timeline-state-reducer';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineList} from './TimelineList';
import {TimelineSlider} from './TimelineSlider';
import {TimelineTracks} from './TimelineTracks';

const Container = styled.div`
	min-height: 100%;
	flex: 1;
	display: flex;
	height: 0;
	overflow: auto;
`;

export const Timeline: React.FC = () => {
	const {sequences} = useContext(Internals.CompositionManager);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const [state, dispatch] = useReducer(timelineStateReducer, {
		collapsed: {},
	});

	const timeline = useMemo((): TrackWithHash[] => {
		if (!videoConfig) {
			return [];
		}

		return calculateTimeline({
			sequences,
			sequenceDuration: videoConfig.durationInFrames,
		});
	}, [sequences, videoConfig]);

	const withoutHidden = useMemo(() => {
		return timeline.filter((t) => !isTrackHidden(t, timeline, state));
	}, [state, timeline]);

	const shown = withoutHidden.slice(0, MAX_TIMELINE_TRACKS);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: shown.length * (TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2),
			display: 'flex',
			flex: 1,
			minHeight: '100%',
			overflowX: 'hidden',
		};
	}, [shown.length]);

	if (!videoConfig) {
		return null;
	}

	return (
		<Container>
			<div style={inner}>
				<SplitterContainer
					orientation="vertical"
					defaultFlex={0.2}
					id="names-to-timeline"
					maxFlex={0.5}
					minFlex={0.15}
				>
					<SplitterElement type="flexer">
						<TimelineList
							dispatchStateChange={dispatch}
							viewState={state}
							timeline={shown}
						/>
					</SplitterElement>
					<SplitterHandle />
					<SplitterElement type="anti-flexer">
						<TimelineTracks
							viewState={state}
							timeline={shown}
							fps={videoConfig.fps}
							hasBeenCut={withoutHidden.length > shown.length}
						/>
						<TimelineSlider />
						<TimelineDragHandler />
					</SplitterElement>
				</SplitterContainer>
			</div>
		</Container>
	);
};
