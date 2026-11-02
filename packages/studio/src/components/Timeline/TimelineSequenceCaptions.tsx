import type {Caption} from '@remotion/captions';
import React, {useCallback} from 'react';
import type {TSequence} from 'remotion';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';
import {TimelineSequenceLabel} from './timeline-sequence-label';

export type TimelineCaptionSource =
	| {readonly type: 'runtime'; readonly key: string}
	| {readonly type: 'static'; readonly value: unknown};

export const TimelineSequenceCaptions: React.FC<{
	readonly s: TSequence;
	readonly source: TimelineCaptionSource;
	readonly startMs: number;
	readonly endMs: number;
}> = ({s, source, startMs, endMs}) => {
	const selectTranscript = useCallback(
		(values: Readonly<Record<string, unknown>>) => {
			const value =
				source.type === 'static' ? source.value : values[source.key];
			const captions = Array.isArray(value) ? (value as Caption[]) : [];
			return captions
				.filter(
					(caption) =>
						endMs > startMs &&
						caption.endMs > startMs &&
						caption.startMs < endMs,
				)
				.map((caption, index, visible) => {
					const next = visible[index + 1];
					return caption.pageBreakAfter &&
						next &&
						!/\s$/.test(caption.text) &&
						!/^\s/.test(next.text)
						? `${caption.text} `
						: caption.text;
				})
				.join('')
				.trim();
		},
		[endMs, source, startMs],
	);
	const transcript = useRuntimeValueSelector({
		controls: source.type === 'runtime' ? s.controls : null,
		selector: selectTranscript,
	});

	return (
		<TimelineSequenceLabel label={transcript}>
			{transcript}
		</TimelineSequenceLabel>
	);
};
