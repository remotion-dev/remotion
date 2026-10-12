import type {Caption} from '@remotion/captions';
import React from 'react';
import type {TSequence} from 'remotion';
import {useRuntimeValue} from '../../helpers/use-runtime-values';
import {TimelineSequenceLabel} from './timeline-sequence-label';

export const TimelineSequenceCaptions: React.FC<{
	readonly s: TSequence;
}> = ({s}) => {
	const captionKey = Object.entries(s.controls?.schema ?? {}).find(
		([, field]) => field.type === 'remotion-captions',
	)?.[0];
	const value = useRuntimeValue(s.controls ?? null, captionKey ?? 'captions');
	const captions = Array.isArray(value) ? (value as Caption[]) : [];
	const transcript = captions
		.map((caption) => caption.text)
		.join('')
		.trim();

	return (
		<TimelineSequenceLabel label={transcript}>
			{transcript}
		</TimelineSequenceLabel>
	);
};
