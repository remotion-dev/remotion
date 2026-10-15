import type {Caption} from '@remotion/captions';
import React, {useCallback} from 'react';
import type {TSequence} from 'remotion';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';
import {TimelineSequenceLabel} from './timeline-sequence-label';

export const TimelineSequenceCaptions: React.FC<{
	readonly s: TSequence;
	readonly startMs: number;
	readonly endMs: number;
}> = ({s, startMs, endMs}) => {
	const captionKey = Object.entries(s.controls?.schema ?? {}).find(
		([, field]) => field.type === 'remotion-captions',
	)?.[0];
	const selectTranscript = useCallback(
		(values: Readonly<Record<string, unknown>>) => {
			const value = values[captionKey ?? 'captions'];
			const captions = Array.isArray(value) ? (value as Caption[]) : [];
			return captions
				.filter(
					(caption) =>
						endMs > startMs &&
						caption.endMs > startMs &&
						caption.startMs < endMs,
				)
				.map((caption) => caption.text)
				.join('')
				.trim();
		},
		[captionKey, endMs, startMs],
	);
	const transcript = useRuntimeValueSelector({
		controls: s.controls ?? null,
		selector: selectTranscript,
	});

	return (
		<TimelineSequenceLabel label={transcript}>
			{transcript}
		</TimelineSequenceLabel>
	);
};
