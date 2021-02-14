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
													(s.sequence.from / videoConfig.durationInFrames) * 100
												}%)`,
												width:
													s.sequence.duration === Infinity
														? width
														: `calc(${
																(s.sequence.duration /
																	videoConfig.durationInFrames) *
																100
														  }%)`,
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
