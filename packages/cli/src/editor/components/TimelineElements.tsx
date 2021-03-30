import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline, Track} from '../helpers/calculate-timeline';
import {TimelineSequence} from './TimelineSequence';

const Container = styled.div`
	height: 100%;
	display: grid;
	grid-gap: 2px;
	grid-auto-rows: minmax(25px, 80px);
`;

export const TimelineElements: React.FC = () => {
	const {sequences} = useContext(Internals.CompositionManager);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const timeline = useMemo((): Track[] => {
		if (!videoConfig) {
			return [];
		}
		return calculateTimeline(sequences, videoConfig.durationInFrames);
	}, [sequences, videoConfig]);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: 82,
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
						return <TimelineSequence key={s.sequence.id} s={s} />;
					})}
				</div>
			))}
		</Container>
	);
};
