import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals, useCurrentFrame} from 'remotion';
import {BLUE} from '../../helpers/colors';
import {
	getTimelineSequenceLayout,
	SEQUENCE_BORDER_WIDTH,
} from '../../helpers/get-timeline-sequence-layout';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_LAYER_HEIGHT_AUDIO,
} from '../../helpers/timeline-layout';
import {useMaxMediaDuration} from '../../helpers/use-max-media-duration';
import {AudioWaveform} from '../AudioWaveform';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {TimelineImageInfo} from './TimelineImageInfo';
import {TIMELINE_TOP_DRAG, useTimelineRowSelection} from './TimelineSelection';
import {TimelineSequenceFrame} from './TimelineSequenceFrame';
import {TimelineSequenceRightEdgeDragHandle} from './TimelineSequenceRightEdgeDragHandle';
import {TimelineVideoInfo} from './TimelineVideoInfo';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';

const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';
const VIDEO_GRADIENT = 'linear-gradient(to top, #8e44ad, #9b59b6)';
const IMAGE_GRADIENT = 'linear-gradient(to top, #2980b9, #3498db)';

const TimelineSequenceFn: React.FC<{
	readonly s: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo | null;
}> = ({s, nodePathInfo}) => {
	const windowWidth = useContext(TimelineWidthContext);

	if (windowWidth === null) {
		return null;
	}

	return (
		<TimelineSequenceInner
			windowWidth={windowWidth}
			s={s}
			nodePathInfo={nodePathInfo}
		/>
	);
};

const TimelineSequenceCurrentFrame: React.FC<{
	readonly s: TSequence;
	readonly displayDurationInFrames: number;
	readonly premountWidth: number | null;
	readonly postmountWidth: number | null;
	readonly style: React.CSSProperties;
	readonly children: React.ReactNode;
	readonly nodePathInfo: SequenceNodePathInfo | null;
}> = ({
	s,
	displayDurationInFrames,
	premountWidth,
	postmountWidth,
	style,
	children,
	nodePathInfo,
}) => {
	const {onSelect, selectable} = useTimelineRowSelection(nodePathInfo);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button === 0) {
				e.stopPropagation();
				onSelect({
					shiftKey: e.shiftKey,
					toggleKey: e.metaKey || e.ctrlKey,
				});
			}
		},
		[onSelect],
	);
	const frame = useCurrentFrame();
	const relativeFrame = frame - s.from;
	const relativeFrameWithPremount = relativeFrame + (s.premountDisplay ?? 0);
	const relativeFrameWithPostmount = relativeFrame - displayDurationInFrames;

	const roundedFrame = Math.round(relativeFrame * 100) / 100;

	const isInRange =
		relativeFrame >= 0 && relativeFrame < displayDurationInFrames;
	const isPremounting =
		relativeFrameWithPremount >= 0 &&
		relativeFrameWithPremount < displayDurationInFrames &&
		!isInRange;
	const isPostmounting =
		relativeFrameWithPostmount >= 0 &&
		relativeFrameWithPostmount < (s.postmountDisplay ?? 0) &&
		!isInRange;

	const actualStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			opacity: isInRange ? 1 : 0.5,
			...(TIMELINE_TOP_DRAG ? {cursor: 'pointer'} : {}),
		};
	}, [isInRange, style]);

	return (
		<div
			style={actualStyle}
			title={s.displayName}
			onPointerDown={selectable ? onPointerDown : undefined}
		>
			{premountWidth ? (
				<div
					style={{
						width: premountWidth,
						height: '100%',
						background: `repeating-linear-gradient(
							-45deg,
							transparent,
							transparent 2px,
							rgba(255, 255, 255, ${isPremounting ? 0.5 : 0.2}) 2px,
							rgba(255, 255, 255, ${isPremounting ? 0.5 : 0.2}) 4px
						)`,
						position: 'absolute',
					}}
				/>
			) : null}

			{postmountWidth ? (
				<div
					style={{
						width: postmountWidth,
						height: '100%',
						background: `repeating-linear-gradient(
							-45deg,
							transparent,
							transparent 2px,
							rgba(255, 255, 255, ${isPostmounting ? 0.5 : 0.2}) 2px,
							rgba(255, 255, 255, ${isPostmounting ? 0.5 : 0.2}) 4px
						)`,
						position: 'absolute',
						right: 0,
					}}
				/>
			) : null}

			{children}

			{s.type !== 'audio' &&
			s.type !== 'video' &&
			s.type !== 'image' &&
			s.loopDisplay === undefined &&
			(isInRange || isPremounting || isPostmounting) ? (
				<div
					style={{
						paddingLeft: 5 + (premountWidth ?? 0),
						height: '100%',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<TimelineSequenceFrame
						premounted={isPremounting}
						postmounted={isPostmounting ? s.duration - 1 : null}
						roundedFrame={roundedFrame}
					/>
				</div>
			) : null}
		</div>
	);
};

const TimelineSequenceInner: React.FC<{
	readonly s: TSequence;
	readonly windowWidth: number;
	readonly nodePathInfo: SequenceNodePathInfo | null;
}> = ({s, windowWidth, nodePathInfo}) => {
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined

	const video = Internals.useVideo();

	const maxMediaDuration = useMaxMediaDuration(s, video?.fps ?? 30);
	const effectiveMaxMediaDuration = s.loopDisplay ? null : maxMediaDuration;

	const originalLocation = useResolveStackAndReactToChange(s.getStack);
	const validatedLocation = useMemo(() => {
		if (
			!originalLocation ||
			!originalLocation.source ||
			!originalLocation.line
		) {
			return null;
		}

		return {
			source: originalLocation.source,
			line: originalLocation.line,
			column: originalLocation.column ?? 0,
		};
	}, [originalLocation]);

	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const codeValuesForOverride = useMemo(() => {
		return nodePath
			? Internals.getCodeValuesCtx(codeValues, nodePath)
			: undefined;
	}, [codeValues, nodePath]);
	const durationCanUpdate = Boolean(
		codeValuesForOverride?.durationInFrames?.canUpdate,
	);

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const displayDurationInFrames = s.loopDisplay
		? s.loopDisplay.durationInFrames * s.loopDisplay.numberOfTimes
		: s.duration;

	const {marginLeft, width, naturalWidth, premountWidth, postmountWidth} =
		useMemo(() => {
			return getTimelineSequenceLayout({
				durationInFrames: displayDurationInFrames,
				startFrom: s.loopDisplay ? s.from + s.loopDisplay.startOffset : s.from,
				startFromMedia:
					s.type === 'sequence' || s.type === 'image' ? 0 : s.startMediaFrom,
				maxMediaDuration: effectiveMaxMediaDuration,
				video,
				windowWidth,
				premountDisplay: s.premountDisplay,
				postmountDisplay: s.postmountDisplay,
			});
		}, [
			displayDurationInFrames,
			effectiveMaxMediaDuration,
			s,
			video,
			windowWidth,
		]);

	const style: React.CSSProperties = useMemo(() => {
		return {
			background:
				s.type === 'audio'
					? AUDIO_GRADIENT
					: s.type === 'video'
						? VIDEO_GRADIENT
						: s.type === 'image'
							? IMAGE_GRADIENT
							: BLUE,
			border: SEQUENCE_BORDER_WIDTH + 'px solid rgba(255, 255, 255, 0.2)',
			borderRadius: 2,
			position: 'absolute',
			height: getTimelineLayerHeight(s.type),
			marginLeft,
			width,
			color: 'white',
			overflow: 'hidden',
		};
	}, [marginLeft, s.type, width]);

	const showRightEdgeDragHandle =
		TIMELINE_TOP_DRAG &&
		(s.type === 'sequence' || s.type === 'image') &&
		!s.loopDisplay &&
		!s.isInsideSeries &&
		nodePath !== null &&
		validatedLocation !== null &&
		durationCanUpdate;

	if (maxMediaDuration === null && !s.loopDisplay) {
		return null;
	}

	return (
		<TimelineSequenceCurrentFrame
			s={s}
			displayDurationInFrames={displayDurationInFrames}
			premountWidth={premountWidth}
			postmountWidth={postmountWidth}
			style={style}
			nodePathInfo={nodePathInfo}
		>
			{s.type === 'audio' ? (
				<AudioWaveform
					src={s.src}
					height={TIMELINE_LAYER_HEIGHT_AUDIO}
					doesVolumeChange={s.doesVolumeChange}
					visualizationWidth={width}
					startFrom={s.startMediaFrom}
					durationInFrames={s.duration}
					volume={s.volume}
					playbackRate={s.playbackRate}
					loopDisplay={s.loopDisplay}
				/>
			) : null}
			{s.type === 'video' ? (
				<TimelineVideoInfo
					src={s.src}
					visualizationWidth={width}
					naturalWidth={naturalWidth}
					trimBefore={s.startMediaFrom}
					durationInFrames={s.duration}
					playbackRate={s.playbackRate}
					volume={s.volume}
					doesVolumeChange={s.doesVolumeChange}
					premountWidth={premountWidth ?? 0}
					postmountWidth={postmountWidth ?? 0}
					loopDisplay={s.loopDisplay}
				/>
			) : null}
			{s.type === 'image' ? (
				<TimelineImageInfo src={s.src} visualizationWidth={width} />
			) : null}
			{s.loopDisplay === undefined ? null : (
				<LoopedTimelineIndicator loops={s.loopDisplay.numberOfTimes} />
			)}
			{showRightEdgeDragHandle && nodePath && validatedLocation ? (
				<TimelineSequenceRightEdgeDragHandle
					nodePath={nodePath}
					validatedLocation={validatedLocation}
					currentDurationInFrames={s.duration}
					windowWidth={windowWidth}
					timelineDurationInFrames={video.durationInFrames ?? 1}
				/>
			) : null}
		</TimelineSequenceCurrentFrame>
	);
};

export const TimelineSequence = React.memo(TimelineSequenceFn);
