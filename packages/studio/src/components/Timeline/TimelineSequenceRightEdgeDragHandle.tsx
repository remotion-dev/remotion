import React, {useCallback, useContext, useRef, useState} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {saveSequenceProp} from './save-sequence-prop';

const HANDLE_WIDTH = 6;
const DURATION_FIELD_KEY = 'durationInFrames';

const baseStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	width: HANDLE_WIDTH,
	cursor: 'ew-resize',
	zIndex: 1,
	touchAction: 'none',
};

export const TimelineSequenceRightEdgeDragHandle: React.FC<{
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly currentDurationInFrames: number;
	readonly windowWidth: number;
	readonly timelineDurationInFrames: number;
}> = ({
	nodePath,
	validatedLocation,
	currentDurationInFrames,
	windowWidth,
	timelineDurationInFrames,
}) => {
	const {setCodeValues, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);

	const [dragging, setDragging] = useState(false);
	const dragStateRef = useRef<{
		initialClientX: number;
		initialDuration: number;
		pxPerFrame: number;
		latestValue: number;
	} | null>(null);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			const pxPerFrame =
				timelineDurationInFrames > 0
					? (windowWidth - TIMELINE_PADDING * 2) / timelineDurationInFrames
					: 0;
			if (pxPerFrame <= 0) {
				return;
			}

			e.stopPropagation();
			e.preventDefault();
			(e.target as Element).setPointerCapture(e.pointerId);
			dragStateRef.current = {
				initialClientX: e.clientX,
				initialDuration: currentDurationInFrames,
				pxPerFrame,
				latestValue: currentDurationInFrames,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			setDragging(true);
		},
		[currentDurationInFrames, timelineDurationInFrames, windowWidth],
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const dragState = dragStateRef.current;
			if (!dragState) {
				return;
			}

			const dx = e.clientX - dragState.initialClientX;
			const deltaFrames = Math.round(dx / dragState.pxPerFrame);
			const next = Math.max(1, dragState.initialDuration + deltaFrames);
			dragState.latestValue = next;
			setDragOverrides(nodePath, DURATION_FIELD_KEY, next);
		},
		[nodePath, setDragOverrides],
	);

	const finishDrag = useCallback(
		(commit: boolean) => {
			const dragState = dragStateRef.current;
			dragStateRef.current = null;
			document.body.style.userSelect = '';
			document.body.style.webkitUserSelect = '';
			setDragging(false);

			if (!dragState) {
				return;
			}

			const shouldCommit =
				commit &&
				previewServerState.type === 'connected' &&
				dragState.latestValue !== dragState.initialDuration;

			if (!shouldCommit) {
				clearDragOverrides(nodePath);
				return;
			}

			saveSequenceProp({
				fileName: validatedLocation.source,
				nodePath,
				fieldKey: DURATION_FIELD_KEY,
				value: dragState.latestValue,
				defaultValue: null,
				schema: NoReactInternals.sequenceSchema,
				setCodeValues,
				clientId:
					previewServerState.type === 'connected'
						? previewServerState.clientId
						: '',
			})
				.catch((err) => {
					Internals.Log.error(
						{logLevel: 'error', tag: null},
						'Could not save durationInFrames',
						err,
					);
				})
				.finally(() => {
					clearDragOverrides(nodePath);
				});
		},
		[
			clearDragOverrides,
			nodePath,
			previewServerState,
			setCodeValues,
			validatedLocation.source,
		],
	);

	const onPointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!dragStateRef.current) {
				return;
			}

			e.stopPropagation();
			(e.target as Element).releasePointerCapture(e.pointerId);
			finishDrag(true);
		},
		[finishDrag],
	);

	const onPointerCancel = useCallback(() => {
		finishDrag(false);
	}, [finishDrag]);

	const style: React.CSSProperties = {
		...baseStyle,
		right: 0,
		background: dragging ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
	};

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			title="Drag to change duration"
			style={style}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerCancel}
		/>
	);
};
