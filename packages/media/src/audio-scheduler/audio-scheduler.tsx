import React, {useMemo} from 'react';
import {useRemotionEnvironment} from 'remotion';
import {AudioSchedulerPreview} from './audio-scheduler-preview';
import {AudioSchedulerRender} from './audio-scheduler-render';
import type {AudioSchedulerProps} from './audio-scheduler-types';
import {normalizeAudioSchedule} from './normalize-audio-schedule';

export const AudioScheduler: React.FC<AudioSchedulerProps> = ({schedule}) => {
	const environment = useRemotionEnvironment();
	const normalizedSchedule = useMemo(
		() => normalizeAudioSchedule(schedule),
		[schedule],
	);

	if (environment.isRendering) {
		return <AudioSchedulerRender schedule={normalizedSchedule} />;
	}

	return <AudioSchedulerPreview schedule={normalizedSchedule} />;
};
