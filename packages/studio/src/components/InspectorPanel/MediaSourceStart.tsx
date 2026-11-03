import React from 'react';
import type {TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {useMediaMetadata} from '../../helpers/use-media-metadata';
import {InputDragger} from '../NewComposition/InputDragger';
import {getTimelineMediaStartFrame} from '../Timeline/get-timeline-media-start-frame';
import {roundToDecimalPlaces} from '../Timeline/timeline-field-utils';
import {InspectorDetailRow} from './common';
import {detailsBeforeInlineAction} from './styles';
import {useMediaSourceStart} from './use-media-source-start';

const formatSourceFrame = (value: number | string) =>
	`${roundToDecimalPlaces(Number(value), 3)}f`;

export const MediaSourceStart: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: Extract<TSequence, {type: 'audio' | 'video'}>;
	readonly sequenceFrameOffset: number;
	readonly editable: boolean;
}> = ({nodePathInfo, sequence, sequenceFrameOffset, editable}) => {
	const metadata = useMediaMetadata(sequence.src);
	const sourceStart =
		sequence.frozenMediaFrame ??
		getTimelineMediaStartFrame({
			startMediaFrom: sequence.startMediaFrom,
			mediaFrameAtSequenceZero: sequence.mediaFrameAtSequenceZero,
			sequenceFrameOffset,
			playbackRate: sequence.playbackRate,
		});
	const disabled = !editable || metadata === null;
	const {preview, commit, cancel} = useMediaSourceStart({
		nodePathInfo,
		sourceStart,
		disabled,
	});
	if (!Number.isFinite(sourceStart)) {
		return null;
	}

	return (
		<div style={detailsBeforeInlineAction}>
			<InspectorDetailRow label="Source start">
				{disabled ? (
					formatSourceFrame(sourceStart)
				) : (
					<InputDragger
						aria-label="Source start"
						aria-description="Source frame at the start of the visible clip"
						type="number"
						value={sourceStart}
						formatter={formatSourceFrame}
						min={0}
						step={1}
						allowStepMismatch
						dragDecimalPlaces={0}
						small
						rightAlign
						status="ok"
						onTextChange={() => undefined}
						onValueChange={preview}
						onValueChangeEnd={commit}
						onValueChangeCancel={cancel}
					/>
				)}
			</InspectorDetailRow>
		</div>
	);
};
