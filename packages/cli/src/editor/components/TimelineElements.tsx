import React, {useContext, useMemo} from 'react';
import {CompositionManager, useVideoConfig} from 'remotion';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {
	TIMELINE_LEFT_PADDING,
	TIMELINE_RIGHT_PADDING,
} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';

export const TimelineElements: React.FC = () => {
	const {width} = useWindowSize();
	const {sequences} = useContext(CompositionManager);
	const videoConfig = useVideoConfig();

	const timeline = useMemo(() => {
		return calculateTimeline(sequences);
	}, [sequences]);

	return (
		<div
			style={{
				width: width - TIMELINE_LEFT_PADDING - TIMELINE_RIGHT_PADDING,
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{timeline.map((track, i) => {
				return (
					<div
						key={i}
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
											'linear-gradient(to bottom, #7474BF, #348AC7 60%)',
										border: '1px solid rgba(255, 255, 255, 0.2)',
										borderRadius: 4,
										position: 'absolute',
										height: 80,
										marginTop: 1,
										marginLeft: `calc(${
											(s.sequence.from / videoConfig.durationInFrames) * 100
										}%)`,
										width: `calc(${
											(s.sequence.duration / videoConfig.durationInFrames) * 100
										}%)`,
									}}
								/>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};
