import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatus,
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

const controlsContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	gap: 2,
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
	fontSize: 8,
	height: 12,
	justifyContent: 'center',
	lineHeight: 1,
	outline: 'none',
	padding: 0,
	userSelect: 'none',
	width: 10,
};

const diamondButtonStyle: React.CSSProperties = {
	...navButtonStyle,
	height: 10,
	width: 10,
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
	dragOverrideValue: unknown;
}): unknown | null => {
	if (propStatus.canUpdate) {
		return Internals.getEffectiveVisualModeValue({
			codeValue: propStatus,
			dragOverrideValue,
			defaultValue,
			shouldResortToDefaultValueIfUndefined: true,
		});
	}

	if (propStatus.reason === 'keyframed') {
		return Internals.interpolateKeyframedStatus({
			frame: jsxFrame,
			status: propStatus,
		});
	}

	return null;
};

export const TimelineKeyframeControls: React.FC<{
	readonly fieldKey: string;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fileName: string;
	readonly keyframeDisplayOffset: number;
	readonly defaultValue: unknown;
	readonly dragOverrideValue: unknown | undefined;
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
		if (propStatus.canUpdate || propStatus.reason === 'computed') {
			return false;
		}

		return hasKeyframeAtSourceFrame(propStatus.keyframes, jsxFrame);
	}, [jsxFrame, propStatus]);

	const previousDisplayFrame = useMemo(
		() => getPreviousKeyframeDisplayFrame(keyframes, timelinePosition),
		[keyframes, timelinePosition],
	);
	const nextDisplayFrame = useMemo(
		() => getNextKeyframeDisplayFrame(keyframes, timelinePosition),
		[keyframes, timelinePosition],
	);

	const canToggleKeyframe =
		propStatus.canUpdate || propStatus.reason === 'keyframed';

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
		(e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			if (!clientId || !canToggleKeyframe) {
				return;
			}

			if (
				hasKeyframeAtCurrentFrame &&
				!propStatus.canUpdate &&
				propStatus.reason === 'keyframed'
			) {
				if (effectIndex === null) {
					void callDeleteSequenceKeyframe({
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

				void callDeleteEffectKeyframe({
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

			const value = getCurrentKeyframeValue({
				propStatus,
				jsxFrame,
				defaultValue,
				dragOverrideValue,
			});
			if (value === null) {
				return;
			}

			if (effectIndex === null) {
				void callAddSequenceKeyframe({
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

			void callAddEffectKeyframe({
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
			defaultValue,
			dragOverrideValue,
			effectIndex,
			fieldKey,
			fileName,
			hasKeyframeAtCurrentFrame,
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
			backgroundColor: hasKeyframeAtCurrentFrame ? BLUE : LIGHT_TEXT,
			borderRadius: 1,
			boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.4)',
			cursor: canToggleKeyframe && clientId ? 'pointer' : 'default',
			opacity: canToggleKeyframe && clientId ? 1 : 0.35,
			transform: 'rotate(45deg)',
		}),
		[canToggleKeyframe, clientId, hasKeyframeAtCurrentFrame],
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
				<svg width="8" height="8" viewBox="0 0 8 8" style={svgStyle}>
					<path d="M5 1L2 4L5 7Z" fill="#ccc" />
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
			/>
			<button
				type="button"
				style={nextStyle}
				disabled={nextDisabled}
				onPointerDown={nextDisabled ? undefined : onNext}
				aria-label="Go to next keyframe"
				title="Next keyframe"
			>
				<svg width="8" height="8" viewBox="0 0 8 8" style={svgStyle}>
					<path d="M3 1L6 4L3 7Z" fill="#ccc" />
				</svg>
			</button>
		</div>
	);
};
