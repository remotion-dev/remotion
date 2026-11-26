import {canvasKeyframeEasingPresets} from '@remotion/sdk';
import {
	isKeyframeEasing,
	LINEAR_KEYFRAME_EASING,
} from '@remotion/studio-shared';
import React, {useCallback, useState} from 'react';
import type {
	CanUpdateSequencePropStatusStatic,
	CanUpdateSequencePropStatusEasing,
} from 'remotion';
import type {
	TimelineFieldOnDragEnd,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {Button} from '../Button';
import {ModalDialog} from '../ModalContainer';
import {areEasingsEqual, EasingCurveEditor} from './EasingEditorModal';

const panelStyle: React.CSSProperties = {
	width: 360,
	maxWidth: '100%',
	maxHeight: '100%',
	overflowY: 'auto',
	marginRight: 0,
	borderRadius: 8,
};

export const TimelineTransitionEasingField: React.FC<{
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: TimelineFieldOnDragEnd;
	readonly onSave: TimelineFieldOnSave;
}> = ({propStatus, onDragValueChange, onDragEnd, onSave}) => {
	const [open, setOpen] = useState(false);
	const easing = isKeyframeEasing(propStatus.codeValue)
		? propStatus.codeValue
		: LINEAR_KEYFRAME_EASING;
	const close = useCallback(() => setOpen(false), []);
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
	const preset = canvasKeyframeEasingPresets.find((item) =>
		areEasingsEqual(easing, item.easing),
	);
	return (
		<>
			<Button
				aria-label="Edit transition easing"
				size="condensed"
				onClick={() => setOpen(true)}
			>
				{preset?.label ?? (easing.type === 'spring' ? 'Spring' : 'Bézier')}
			</Button>
			{open ? (
				<ModalDialog
					ariaLabel="Transition easing"
					onOutsideClick={close}
					onEscape={close}
					panelStyle={panelStyle}
				>
					<EasingCurveEditor
						initialEasing={easing}
						graphLabels={null}
						renderHeader={null}
						applyLiveEasing={onDragValueChange}
						commitEasing={commit}
						cancelPreview={cancelPreview}
					/>
				</ModalDialog>
			) : null}
		</>
	);
};
