import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline, Track} from '../../helpers/calculate-timeline';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineList} from './TimelineList';
import {TimelineSequence} from './TimelineSequence';
import {TimelineSlider} from './TimelineSlider';

const Container = styled.div`
	min-height: 100%;
	flex: 1;
	display: flex;
`;

export const Timeline: React.FC = () => {
	const {sequences} = useContext(Internals.CompositionManager);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const timeline = useMemo((): Track[] => {
		if (!videoConfig) {
			return [];
		}
		return calculateTimeline({
			sequences,
			sequenceDuration: videoConfig.durationInFrames,
		});
	}, [sequences, videoConfig]);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LAYER_HEIGHT + 2,
		};
	}, []);

	if (!videoConfig) {
		return null;
	}

	return (
		<Container>
			<SplitterContainer
				orientation="vertical"
				defaultFlex={0.2}
				id="names-to-timeline"
				maxFlex={0.5}
				minFlex={0.15}
			>
				<SplitterElement type="flexer">
					<TimelineList timeline={timeline} />
				</SplitterElement>
				<SplitterHandle />
				<SplitterElement type="anti-flexer">
					<TimelineDragHandler>
						{timeline.map((track) => (
							<div key={track.sequence.id} style={inner}>
								<TimelineSequence fps={videoConfig.fps} s={track.sequence} />
							</div>
						))}
					</TimelineDragHandler>
					<TimelineSlider />
				</SplitterElement>
			</SplitterContainer>
		</Container>
	);
};
