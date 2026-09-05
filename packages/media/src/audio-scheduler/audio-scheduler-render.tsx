import React from 'react';
import {Sequence, useVideoConfig} from 'remotion';
import {Audio} from '../audio/audio';
import {getAudioSchedulerRenderTiming} from './audio-scheduler-timeline';
import type {NormalizedAudioSchedule} from './audio-scheduler-types';

export const AudioSchedulerRender: React.FC<{
	readonly schedule: NormalizedAudioSchedule;
}> = ({schedule}) => {
	const {fps} = useVideoConfig();

	return (
		<>
			{schedule.map((entry) => {
				const {from, durationInFrames} = getAudioSchedulerRenderTiming({
					startTimeInSeconds: entry.startTimeInSeconds,
					durationInSeconds: entry.durationInSeconds,
					fps,
				});

				return (
					<Sequence
						key={entry.id}
						from={from}
						durationInFrames={durationInFrames}
						showInTimeline={false}
					>
						<Audio
							src={entry.renderSrc}
							trimBefore={entry.sourceStartTimeInSeconds * fps}
							trimAfter={
								(entry.sourceStartTimeInSeconds + entry.durationInSeconds) * fps
							}
							volume={entry.volume}
						/>
					</Sequence>
				);
			})}
		</>
	);
};
