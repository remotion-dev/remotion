import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline, Track} from '../helpers/calculate-timeline';
import {
	TIMELINE_LEFT_PADDING,
	TIMELINE_RIGHT_PADDING,
} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';
import {TimelineSequence} from './TimelineSequence';

const Pre = styled.pre`
	color: white;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
	margin-top: 0;
	margin-bottom: 0;
	padding: 5px;
`;

export const TimelineElements: React.FC = () => {
	const {width} = useWindowSize();
	const {sequences} = useContext(Internals.CompositionManager);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const timeline = useMemo((): Track[] => {
		if (!videoConfig) {
			return [];
		}
		return calculateTimeline(sequences, videoConfig.durationInFrames);
	}, [sequences, videoConfig]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width: width - TIMELINE_LEFT_PADDING - TIMELINE_RIGHT_PADDING,
			overflow: 'hidden',
			position: 'relative',
		};
	}, [width]);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: 82,
		};
	}, []);

	return (
		<div style={outer}>
			{videoConfig
				? timeline.map((track) => {
						return (
							<div key={track.trackId} style={inner}>
								{track.sequences.map((s) => {
									return <TimelineSequence key={s.sequence.id} s={s} />;
								})}
							</div>
						);
				  })
				: null}
		</div>
	);
};
