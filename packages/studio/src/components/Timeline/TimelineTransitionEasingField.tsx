import {canvasKeyframeEasingPresets} from '@remotion/sdk';
import {
	isKeyframeEasing,
	LINEAR_KEYFRAME_EASING,
} from '@remotion/studio-shared';
import React, {useCallback} from 'react';
import type {
	CanUpdateSequencePropStatusStatic,
	CanUpdateSequencePropStatusEasing,
} from 'remotion';
import type {
	TimelineFieldOnDragEnd,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {areEasingsEqual, EasingCurveEditor} from './EasingEditorModal';

export const getTransitionEasingLabel = (value: unknown): string => {
	const easing = isKeyframeEasing(value) ? value : LINEAR_KEYFRAME_EASING;
	const preset = canvasKeyframeEasingPresets.find((item) =>
		areEasingsEqual(easing, item.easing),
	);
	return preset?.label ?? (easing.type === 'spring' ? 'Spring' : 'Bézier');
};

export const TimelineTransitionEasingField: React.FC<{
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: TimelineFieldOnDragEnd;
	readonly onSave: TimelineFieldOnSave;
}> = ({propStatus, onDragValueChange, onDragEnd, onSave}) => {
	const easing = isKeyframeEasing(propStatus.codeValue)
		? propStatus.codeValue
		: LINEAR_KEYFRAME_EASING;
	const cancelPreview = useCallback(() => onDragEnd('cancel'), [onDragEnd]);
	const commit = useCallback(
		(next: CanUpdateSequencePropStatusEasing) => {
			if (
				isKeyframeEasing(propStatus.codeValue) &&
				areEasingsEqual(propStatus.codeValue, next)
			) {
				cancelPreview();
				return;
			}

			onSave(next)
				.catch(() => undefined)
				.finally(() => onDragEnd('commit'));
		},
		[cancelPreview, propStatus.codeValue, onDragEnd, onSave],
	);
	return (
		<div role="group" aria-label="Transition easing" style={{marginTop: 8}}>
			<EasingCurveEditor
				initialEasing={easing}
				graphLabels={null}
				renderHeader={null}
				applyLiveEasing={onDragValueChange}
				commitEasing={commit}
				cancelPreview={cancelPreview}
			/>
		</div>
	);
};
