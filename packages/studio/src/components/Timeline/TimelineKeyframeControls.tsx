import {isSchemaFieldKeyframable} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	DragOverrideValue,
	SequencePropsSubscriptionKey,
	SequenceSchema,
} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BLUE, LIGHT_TEXT} from '../../helpers/colors';
import {
	callAddEffectKeyframe,
	callAddSequenceKeyframe,
} from './call-add-keyframe';
import {
	callDeleteEffectKeyframe,
	callDeleteSequenceKeyframe,
} from './call-delete-keyframe';
import {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from './get-keyframe-navigation';
import {getTimelineKeyframes} from './get-timeline-keyframes';
import {SELECTION_ENABLED} from './TimelineSelection';

const controlsContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	gap: 1,
	marginRight: 4,
};

const navButtonStyle: React.CSSProperties = {
	alignItems: 'center',
	background: 'none',
	border: 'none',
	color: 'white',
	cursor: 'pointer',
	display: 'flex',
	flexShrink: 0,
	height: 14,
	justifyContent: 'center',
	lineHeight: 1,
	outline: 'none',
	padding: 0,
	userSelect: 'none',
	width: 14,
};

const isKeyframedStatus = (
	status: CanUpdateSequencePropStatus,
): status is CanUpdateSequencePropStatusKeyframed => {
	return status.status === 'keyframed';
};

const diamondButtonStyle: React.CSSProperties = {
	...navButtonStyle,
	background: 'none',
	translate: '0 -0.5px',
};

const diamondIconStyle: React.CSSProperties = {
	borderRadius: 1,
	boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.4)',
	height: 7,
	transform: 'rotate(45deg)',
	width: 7,
};

const svgStyle: React.CSSProperties = {display: 'block'};

const getCurrentKeyframeValue = ({
	propStatus,
	jsxFrame,
	defaultValue,
	dragOverrideValue,
}: {
	propStatus: CanUpdateSequencePropStatus;
	jsxFrame: number;
	defaultValue: unknown;
	dragOverrideValue: DragOverrideValue | undefined;
}): unknown | null => {
	if (isKeyframedStatus(propStatus)) {
		const dragOverride = Internals.resolveDragOverrideValue({
			dragOverrideValue,
			frame: jsxFrame,
		});
		if (dragOverride.type === 'resolved') {
			return dragOverride.value;
		}

		const keyframedStatus = propStatus as CanUpdateSequencePropStatusKeyframed;
		return Internals.interpolateKeyframedStatus({
			frame: jsxFrame,
			status: keyframedStatus,
		});
	}

	if (propStatus.status === 'static') {
		return Internals.getEffectiveVisualModeValue({
			codeValue: propStatus,
			dragOverrideValue,
			defaultValue,
			shouldResortToDefaultValueIfUndefined: true,
		});
	}

	return null;
};

export const shouldShowTimelineKeyframeControls = ({
	propStatus,
	selected,
	keyframable,
}: {
	propStatus: CanUpdateSequencePropStatus | null;
	selected: boolean;
	keyframable: boolean;
}): boolean => {
	if (propStatus === null) {
		return false;
	}

	if (!keyframable && !isKeyframedStatus(propStatus)) {
		return false;
	}

	if (selected) {
		return true;
	}

	return SELECTION_ENABLED && isKeyframedStatus(propStatus);
};

export const TimelineKeyframeControls: React.FC<{
	readonly fieldKey: string;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fileName: string;
	readonly keyframeDisplayOffset: number;
	readonly defaultValue: unknown;
	readonly dragOverrideValue: DragOverrideValue | undefined;
	readonly schema: SequenceSchema;
	readonly effectIndex: number | null;
}> = ({
	fieldKey,
	propStatus,
	nodePath,
	fileName,
	keyframeDisplayOffset,
	defaultValue,
	dragOverrideValue,
	schema,
	effectIndex,
}) => {
	const videoConfig = useVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.useTimelineSetFrame();
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);

	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const jsxFrame = timelinePosition - keyframeDisplayOffset;
	const keyframes = useMemo(
		() => getTimelineKeyframes(propStatus, keyframeDisplayOffset),
		[propStatus, keyframeDisplayOffset],
	);

	const hasKeyframeAtCurrentFrame = useMemo(() => {
		if (!isKeyframedStatus(propStatus)) {
			return false;
		}

		return hasKeyframeAtSourceFrame(
			(propStatus as CanUpdateSequencePropStatusKeyframed).keyframes,
			jsxFrame,
		);
	}, [jsxFrame, propStatus]);

	const currentKeyframeValue = useMemo(
		() =>
			getCurrentKeyframeValue({
				propStatus,
				jsxFrame,
				defaultValue,
				dragOverrideValue,
			}),
		[defaultValue, dragOverrideValue, jsxFrame, propStatus],
	);

	const previousDisplayFrame = useMemo(
		() => getPreviousKeyframeDisplayFrame(keyframes, timelinePosition),
		[keyframes, timelinePosition],
	);
	const nextDisplayFrame = useMemo(
		() => getNextKeyframeDisplayFrame(keyframes, timelinePosition),
		[keyframes, timelinePosition],
	);

	const keyframable = isSchemaFieldKeyframable({
		schema,
		key: fieldKey,
	});
	const canAddKeyframe = keyframable;
	const canToggleKeyframe =
		propStatus.status !== 'computed' &&
		(hasKeyframeAtCurrentFrame || canAddKeyframe);

	const seekToDisplayFrame = useCallback(
		(frame: number) => {
			setFrame((current) => {
				const next = {...current, [videoConfig.id]: frame};
				Internals.persistCurrentFrame(next);
				return next;
			});
		},
		[setFrame, videoConfig.id],
	);

	const onPrevious = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			if (previousDisplayFrame !== null) {
				seekToDisplayFrame(previousDisplayFrame);
			}
		},
		[previousDisplayFrame, seekToDisplayFrame],
	);

	const onNext = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			if (nextDisplayFrame !== null) {
				seekToDisplayFrame(nextDisplayFrame);
			}
		},
		[nextDisplayFrame, seekToDisplayFrame],
	);

	const onToggleKeyframe = useCallback(
		async (e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			if (!clientId || !canToggleKeyframe) {
				return;
			}

			if (hasKeyframeAtCurrentFrame && isKeyframedStatus(propStatus)) {
				if (effectIndex === null) {
					await callDeleteSequenceKeyframe({
						fileName,
						nodePath,
						fieldKey,
						sourceFrame: jsxFrame,
						schema,
						setCodeValues,
						clientId,
					});
					return;
				}

				await callDeleteEffectKeyframe({
					fileName,
					nodePath,
					effectIndex,
					fieldKey,
					sourceFrame: jsxFrame,
					schema,
					setCodeValues,
					clientId,
				});
				return;
			}

			const value = currentKeyframeValue;
			if (value === null) {
				return;
			}

			if (effectIndex === null) {
				await callAddSequenceKeyframe({
					fileName,
					nodePath,
					fieldKey,
					sourceFrame: jsxFrame,
					value,
					schema,
					setCodeValues,
					clientId,
				});
				return;
			}

			await callAddEffectKeyframe({
				fileName,
				nodePath,
				effectIndex,
				fieldKey,
				sourceFrame: jsxFrame,
				value,
				schema,
				setCodeValues,
				clientId,
			});
		},
		[
			canToggleKeyframe,
			clientId,
			effectIndex,
			fieldKey,
			fileName,
			hasKeyframeAtCurrentFrame,
			currentKeyframeValue,
			jsxFrame,
			nodePath,
			propStatus,
			schema,
			setCodeValues,
		],
	);

	const previousDisabled = previousDisplayFrame === null;
	const nextDisabled = nextDisplayFrame === null;

	const previousStyle = useMemo(
		(): React.CSSProperties => ({
			...navButtonStyle,
			cursor: previousDisabled ? 'default' : 'pointer',
			opacity: previousDisabled ? 0.35 : 1,
		}),
		[previousDisabled],
	);

	const nextStyle = useMemo(
		(): React.CSSProperties => ({
			...navButtonStyle,
			cursor: nextDisabled ? 'default' : 'pointer',
			opacity: nextDisabled ? 0.35 : 1,
		}),
		[nextDisabled],
	);

	const diamondStyle = useMemo(
		(): React.CSSProperties => ({
			...diamondButtonStyle,
			cursor: canToggleKeyframe && clientId ? 'pointer' : 'default',
			opacity: canToggleKeyframe && clientId ? 1 : 0.35,
		}),
		[canToggleKeyframe, clientId],
	);

	const diamondIcon = useMemo(
		(): React.CSSProperties => ({
			...diamondIconStyle,
			backgroundColor: hasKeyframeAtCurrentFrame ? BLUE : LIGHT_TEXT,
		}),
		[hasKeyframeAtCurrentFrame],
	);

	return (
		<div style={controlsContainerStyle}>
			<button
				type="button"
				style={previousStyle}
				disabled={previousDisabled}
				onPointerDown={previousDisabled ? undefined : onPrevious}
				aria-label="Go to previous keyframe"
				title="Previous keyframe"
			>
				<svg width="14" height="14" viewBox="0 0 10 10" style={svgStyle}>
					<path d="M7 1.5L3 5L7 8.5Z" fill="#ccc" />
				</svg>
			</button>
			<button
				type="button"
				style={diamondStyle}
				disabled={!canToggleKeyframe || !clientId}
				onPointerDown={
					canToggleKeyframe && clientId ? onToggleKeyframe : undefined
				}
				aria-label={
					hasKeyframeAtCurrentFrame ? 'Remove keyframe' : 'Add keyframe'
				}
				title={hasKeyframeAtCurrentFrame ? 'Remove keyframe' : 'Add keyframe'}
			>
				<span style={diamondIcon} />
			</button>
			<button
				type="button"
				style={nextStyle}
				disabled={nextDisabled}
				onPointerDown={nextDisabled ? undefined : onNext}
				aria-label="Go to next keyframe"
				title="Next keyframe"
			>
				<svg width="14" height="14" viewBox="0 0 10 10" style={svgStyle}>
					<path d="M3 1.5L7 5L3 8.5Z" fill="#ccc" />
				</svg>
			</button>
		</div>
	);
};
