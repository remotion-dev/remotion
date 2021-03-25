import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline, Track} from '../../helpers/calculate-timeline';
import {TIMELINE_LAYER_HEIGHT} from '../../helpers/timeline-layout';
import {TimelineSequence} from './TimelineSequence';

const Container = styled.div`
	height: 100%;
	display: grid;
	grid-gap: 2px;
	grid-auto-rows: minmax(25px, ${TIMELINE_LAYER_HEIGHT}px);
`;

export const TimelineElements: React.FC = () => {
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
			{timeline.map((track) => (
				<div key={track.trackId} style={inner}>
					{track.sequences.map((s) => {
						return <TimelineSequence key={s.id} s={s} />;
					})}
				</div>
			))}
		</Container>
	);
};
