import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline, Track} from '../../helpers/calculate-timeline';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineList} from './TimelineList';
import {TimelineSlider} from './TimelineSlider';
import {TimelineTracks} from './TimelineTracks';

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
					<TimelineTracks timeline={timeline} fps={videoConfig.fps} />
					<TimelineSlider />
					<TimelineDragHandler />
				</SplitterElement>
			</SplitterContainer>
		</Container>
	);
};
