import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {useVideoConfig} from 'remotion';
import {
	BLUE,
	LIGHT_TEXT,
	TIMELINE_TRACK_SEPARATOR,
	WHITE,
	WHITE_ALPHA_08,
	WHITE_ALPHA_20,
} from '../../helpers/colors';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {CaptionTimingEditContext} from '../../state/caption-timing-edit';
import type {CaptionJson} from '../caption-json';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from '../ForceSpecificCursor';
import {
	applyCaptionTimingDrag,
	millisecondsToFrames,
	type CaptionTimingDragType,
} from './caption-timing';
import {
	TIMELINE_TIME_INDICATOR_HEIGHT,
	TimelineTimePadding,
} from './TimelineTimeIndicators';
import {TimelineWidthContext} from './TimelineWidthProvider';

const LANE_HEIGHT = 42;
const HANDLE_WIDTH = 5;

const lane: React.CSSProperties = {
	borderBottom: `${TIMELINE_ITEM_BORDER_BOTTOM}px solid ${TIMELINE_TRACK_SEPARATOR}`,
	boxSizing: 'border-box',
	height: LANE_HEIGHT,
	position: 'relative',
};

const itemBase: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: BLUE,
	border: `1px solid ${WHITE_ALPHA_20}`,
	borderRadius: 3,
	boxSizing: 'border-box',
	color: WHITE,
	cursor: 'pointer',
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 11,
	height: 30,
	lineHeight: '14px',
	overflow: 'hidden',
	position: 'absolute',
	top: 6,
	touchAction: 'none',
	userSelect: 'none',
};

const itemLabel: React.CSSProperties = {
	color: 'inherit',
	flex: 1,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 11,
	lineHeight: '14px',
	minWidth: 0,
	overflow: 'hidden',
	padding: `0 ${HANDLE_WIDTH + 2}px`,
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const handleBase: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: WHITE_ALPHA_20,
	border: 0,
	bottom: 0,
	cursor: 'ew-resize',
	padding: 0,
	position: 'absolute',
	top: 0,
	width: HANDLE_WIDTH,
	zIndex: 1,
};

const leftHandle: React.CSSProperties = {
	...handleBase,
	left: 0,
};

const rightHandle: React.CSSProperties = {
	...handleBase,
	right: 0,
};

const listLabel: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: `${TIMELINE_ITEM_BORDER_BOTTOM}px solid ${TIMELINE_TRACK_SEPARATOR}`,
	boxSizing: 'border-box',
	color: WHITE,
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	height: LANE_HEIGHT,
	justifyContent: 'space-between',
	lineHeight: '16px',
	minWidth: 0,
	padding: '0 10px',
};

const count: React.CSSProperties = {
	color: LIGHT_TEXT,
	flexShrink: 0,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 11,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: '16px',
};

const CaptionTimingItem: React.FC<{
	readonly caption: CaptionJson;
	readonly index: number;
	readonly nextCaption: CaptionJson | null;
	readonly pixelsPerFrame: number;
	readonly previousCaption: CaptionJson | null;
}> = ({caption, index, nextCaption, pixelsPerFrame, previousCaption}) => {
	const {durationInFrames, fps} = useVideoConfig();
	const {selectCaption, selectedCaptionIndex, session, updateCaptions} =
		useContext(CaptionTimingEditContext);
	const [preview, setPreview] = useState<CaptionJson | null>(null);
	const [hovered, setHovered] = useState(false);
	const removeListeners = useRef<(() => void) | null>(null);
	const displayedCaption = preview ?? caption;

	useEffect(() => {
		return () => removeListeners.current?.();
	}, []);

	const commitCaption = useCallback(
		(updatedCaption: CaptionJson) => {
			if (session === null) {
				return;
			}

			updateCaptions(
				session.ownerId,
				session.captions.map((current, currentIndex) =>
					currentIndex === index ? updatedCaption : current,
				),
			);
		},
		[index, session, updateCaptions],
	);

	const startDrag = useCallback(
		(event: React.PointerEvent<HTMLElement>, type: CaptionTimingDragType) => {
			if (
				session === null ||
				pixelsPerFrame <= 0 ||
				event.button !== 0 ||
				!event.isPrimary
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.currentTarget.closest<HTMLElement>('[tabindex="0"]')?.focus();
			const {clientX: initialX, pointerId} = event;
			let nextValue = caption;
			let hasChanged = false;

			const cleanup = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerCancel);
				stopForcingSpecificCursor();
				removeListeners.current = null;
			};

			const onPointerMove = (pointerEvent: PointerEvent) => {
				if (pointerEvent.pointerId !== pointerId) {
					return;
				}

				const deltaFrames = (pointerEvent.clientX - initialX) / pixelsPerFrame;
				if (Math.round(deltaFrames) === 0) {
					hasChanged = false;
					setPreview(null);
					return;
				}

				nextValue = applyCaptionTimingDrag({
					caption,
					previousCaption,
					nextCaption,
					deltaFrames,
					durationInFrames,
					fps,
					type,
				});
				hasChanged =
					nextValue.startMs !== caption.startMs ||
					nextValue.endMs !== caption.endMs;
				setPreview(hasChanged ? nextValue : null);
			};

			const onPointerUp = (pointerEvent: PointerEvent) => {
				if (pointerEvent.pointerId !== pointerId) {
					return;
				}

				cleanup();
				setPreview(null);
				if (hasChanged) {
					commitCaption(nextValue);
				}
			};

			const onPointerCancel = (pointerEvent: PointerEvent) => {
				if (pointerEvent.pointerId !== pointerId) {
					return;
				}

				cleanup();
				setPreview(null);
			};

			removeListeners.current?.();
			forceSpecificCursor('ew-resize');
			removeListeners.current = cleanup;
			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerCancel);
		},
		[
			caption,
			commitCaption,
			durationInFrames,
			fps,
			nextCaption,
			pixelsPerFrame,
			previousCaption,
			session,
		],
	);

	const nudgeCaption = useCallback(
		(event: React.KeyboardEvent<HTMLElement>, type: CaptionTimingDragType) => {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			const direction = event.key === 'ArrowLeft' ? -1 : 1;
			commitCaption(
				applyCaptionTimingDrag({
					caption,
					previousCaption,
					nextCaption,
					deltaFrames: direction * (event.shiftKey ? 5 : 1),
					durationInFrames,
					fps,
					type,
				}),
			);
		},
		[
			caption,
			commitCaption,
			durationInFrames,
			fps,
			nextCaption,
			previousCaption,
		],
	);

	const startFrame = Math.max(
		0,
		Math.min(
			durationInFrames,
			millisecondsToFrames(displayedCaption.startMs, fps),
		),
	);
	const endFrame = Math.max(
		startFrame,
		Math.min(
			durationInFrames,
			millisecondsToFrames(displayedCaption.endMs, fps),
		),
	);
	const left = TIMELINE_PADDING + startFrame * pixelsPerFrame;
	const width = Math.max(
		HANDLE_WIDTH * 2 + 2,
		(endFrame - startFrame) * pixelsPerFrame,
	);

	return (
		<div
			aria-label={`${caption.text.trim()}, ${Math.round(displayedCaption.startMs)} to ${Math.round(displayedCaption.endMs)} milliseconds`}
			onKeyDown={(event) => {
				if (
					(event.key === 'Enter' || event.key === ' ') &&
					event.target === event.currentTarget &&
					session
				) {
					event.preventDefault();
					selectCaption(session.ownerId, index);
				}
			}}
			onPointerDown={(event) => {
				event.stopPropagation();
			}}
			onPointerDownCapture={() => {
				if (session) {
					selectCaption(session.ownerId, index);
				}
			}}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			role="group"
			style={{
				...itemBase,
				backgroundColor: hovered || preview ? '#2998ff' : BLUE,
				boxShadow:
					preview || selectedCaptionIndex === index
						? `0 0 0 1px ${WHITE}`
						: undefined,
				left,
				width,
			}}
			tabIndex={0}
			title={`${caption.text.trim()}\n${Math.round(displayedCaption.startMs)} → ${Math.round(displayedCaption.endMs)} ms`}
		>
			<button
				aria-label="Adjust caption start"
				onKeyDown={(event) => nudgeCaption(event, 'resize-start')}
				onPointerDown={(event) => startDrag(event, 'resize-start')}
				style={leftHandle}
				type="button"
			/>
			<div style={itemLabel}>{caption.text.trim() || 'Untitled caption'}</div>
			<button
				aria-label="Adjust caption end"
				onKeyDown={(event) => nudgeCaption(event, 'resize-end')}
				onPointerDown={(event) => startDrag(event, 'resize-end')}
				style={rightHandle}
				type="button"
			/>
		</div>
	);
};

export const CaptionTimingLane: React.FC = () => {
	const timelineWidth = useContext(TimelineWidthContext);
	const {session} = useContext(CaptionTimingEditContext);
	const {durationInFrames} = useVideoConfig();
	const captions = session?.captions;
	const captionRows = useMemo(() => {
		const occurrences = new Map<string, number>();
		return (captions ?? []).map((caption, index) => {
			const signature = [caption.text, caption.confidence].join('-');
			const occurrence = occurrences.get(signature) ?? 0;
			occurrences.set(signature, occurrence + 1);
			return {caption, index, key: `${signature}-${occurrence}`};
		});
	}, [captions]);

	if (timelineWidth === null || session === null || durationInFrames <= 0) {
		return null;
	}

	const pixelsPerFrame =
		(timelineWidth - TIMELINE_PADDING * 2) / durationInFrames;

	return (
		<div
			style={{
				minHeight: TIMELINE_TIME_INDICATOR_HEIGHT + LANE_HEIGHT,
				position: 'relative',
				width: timelineWidth,
			}}
		>
			<TimelineTimePadding />
			<div style={lane}>
				{captionRows.map(({caption, index, key}) => (
					<CaptionTimingItem
						key={key}
						caption={caption}
						index={index}
						nextCaption={captions?.[index + 1] ?? null}
						pixelsPerFrame={pixelsPerFrame}
						previousCaption={captions?.[index - 1] ?? null}
					/>
				))}
			</div>
		</div>
	);
};

export const CaptionTimingTimelineList: React.FC = () => {
	const {session} = useContext(CaptionTimingEditContext);

	return (
		<div style={{backgroundColor: WHITE_ALPHA_08, minHeight: '100%'}}>
			<TimelineTimePadding />
			<div style={listLabel}>
				<div
					style={{
						color: WHITE,
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 12,
						lineHeight: '16px',
						minWidth: 0,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					Captions
				</div>
				<div style={count}>{session?.captions.length ?? 0}</div>
			</div>
		</div>
	);
};
