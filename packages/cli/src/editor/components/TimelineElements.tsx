import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {calculateTimeline, Track} from '../helpers/calculate-timeline';
import {
	TIMELINE_LEFT_PADDING,
	TIMELINE_RIGHT_PADDING,
} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';

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

	// If a composition is 100 frames long, the last frame is 99
	// and therefore frame 99 should be at the right
	const lastFrame = (videoConfig?.durationInFrames ?? 1) - 1;

	return (
		<div
			style={{
				width: width - TIMELINE_LEFT_PADDING - TIMELINE_RIGHT_PADDING,
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{videoConfig
				? timeline.map((track) => {
						return (
							<div
								key={track.trackId}
								style={{
									height: 82,
								}}
							>
								{track.sequences.map((s) => {
									// If a duration is 1, it is essentially a still and it should have width 0
									const spatialDuration = s.sequence.duration - 1;
									return (
										<div
											key={s.sequence.id}
											style={{
												background:
													'linear-gradient(to bottom, #3697e1, #348AC7 60%)',
												border: '1px solid rgba(255, 255, 255, 0.2)',
												borderRadius: 4,
												position: 'absolute',
												height: 80,
												marginTop: 1,
												marginLeft: `calc(${
													(s.sequence.from / lastFrame) * 100
												}%)`,
												width:
													s.sequence.duration === Infinity
														? width
														: `calc(${(spatialDuration / lastFrame) * 100}%)`,
												color: 'white',
												overflow: 'hidden',
											}}
											title={s.sequence.displayName}
										>
											<Pre>{s.sequence.displayName}</Pre>
										</div>
									);
								})}
							</div>
						);
				  })
				: null}
		</div>
	);
};
