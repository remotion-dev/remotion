import {useCallback, useContext, useMemo, useState} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {useTimelinePosition} from './timeline-position-state.js';
import {TimelineContext} from './TimelineContext.js';
import {useVideoConfig} from './use-video-config.js';

export type ClientAudioBoundary = {
	readonly frame: number;
	readonly advance: () => void;
	readonly reset: () => void;
};

export const useClientAudioSample = () => {
	const inherited = useContext(TimelineContext);
	const frame = useTimelinePosition();
	const {id} = useVideoConfig();
	const parent = useContext(SequenceContext);
	const outputFrame = inherited?.clientAudioOutputFrame ?? null;
	const clockOrigin = parent?.absoluteFrom ?? 0;
	const [sample, setSample] = useState<{
		readonly outputFrame: number;
		readonly clockOrigin: number;
		readonly frame: number;
		readonly iteration: number | null;
	} | null>(null);
	const inheritedFrame = inherited?.clientAudioSampleFrame ?? frame;
	const active =
		sample !== null &&
		sample.outputFrame === outputFrame &&
		sample.clockOrigin === clockOrigin &&
		sample.frame >= inheritedFrame;
	const evaluationFrame = active ? sample.frame : inheritedFrame;
	const sampleAt = useCallback(
		(sampleFrame: number, iteration: number | null) => {
			if (outputFrame !== null) {
				setSample({outputFrame, clockOrigin, frame: sampleFrame, iteration});
			}
		},
		[clockOrigin, outputFrame],
	);
	const reset = useCallback(() => setSample(null), []);
	const timeline = useMemo(
		() =>
			active && inherited
				? {
						...inherited,
						frame: {...inherited.frame, [id]: evaluationFrame},
						clientAudioSampleFrame: evaluationFrame,
					}
				: inherited,
		[active, evaluationFrame, id, inherited],
	);
	return {
		enabled: outputFrame !== null && inherited?.isInsideFreeze !== true,
		frame: evaluationFrame,
		iteration: active ? sample.iteration : null,
		timeline,
		sampleAt,
		reset,
	};
};
