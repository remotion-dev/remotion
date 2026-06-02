import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {saveSequenceProp} from './save-sequence-prop';

const HANDLE_WIDTH = 6;

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
		pointerId: number;
	} | null>(null);

	// Keep latest props/setters available to window listeners installed once at pointerdown.
	const latestRef = useRef({
		nodePath,
		validatedLocation,
		setCodeValues,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
	});
	latestRef.current = {
		nodePath,
		validatedLocation,
		setCodeValues,
		setDragOverrides,
		clearDragOverrides,
		previewServerState,
	};

	const finishDrag = useCallback((commit: boolean) => {
		const dragState = dragStateRef.current;
		dragStateRef.current = null;
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		setDragging(false);

		if (!dragState) {
			return;
		}

		const {
			nodePath: latestNodePath,
			validatedLocation: latestLocation,
			setCodeValues: latestSetCodeValues,
			clearDragOverrides: latestClear,
			previewServerState: latestServerState,
		} = latestRef.current;

		const shouldCommit =
			commit &&
			latestServerState.type === 'connected' &&
			dragState.latestValue !== dragState.initialDuration;

		if (!shouldCommit) {
			latestClear(latestNodePath);
			return;
		}

		saveSequenceProp({
			fileName: latestLocation.source,
			nodePath: latestNodePath,
			fieldKey: 'durationInFrames',
			value: dragState.latestValue,
			defaultValue: null,
			schema: NoReactInternals.sequenceSchema,
			setCodeValues: latestSetCodeValues,
			clientId:
				latestServerState.type === 'connected'
					? latestServerState.clientId
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
				latestClear(latestNodePath);
			});
	}, []);

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
			dragStateRef.current = {
				initialClientX: e.clientX,
				initialDuration: currentDurationInFrames,
				pxPerFrame,
				latestValue: currentDurationInFrames,
				pointerId: e.pointerId,
			};
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			setDragging(true);
		},
		[currentDurationInFrames, timelineDurationInFrames, windowWidth],
	);

	// Install global pointer listeners while dragging. They survive parent re-renders
	// and element remounts that would otherwise drop React's synthetic handlers or
	// pointer capture.
	useEffect(() => {
		if (!dragging) {
			return;
		}

		const onMove = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			const dx = e.clientX - dragState.initialClientX;
			const deltaFrames = Math.round(dx / dragState.pxPerFrame);
			const next = Math.max(1, dragState.initialDuration + deltaFrames);
			dragState.latestValue = next;
			latestRef.current.setDragOverrides(
				latestRef.current.nodePath,
				'durationInFrames',
				next,
			);
		};

		const onUp = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(true);
		};

		const onCancel = (e: PointerEvent) => {
			const dragState = dragStateRef.current;
			if (!dragState || e.pointerId !== dragState.pointerId) {
				return;
			}

			finishDrag(false);
		};

		// Bail if the page loses focus mid-drag.
		const onWindowBlur = () => {
			finishDrag(false);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onCancel);
		window.addEventListener('blur', onWindowBlur);

		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onCancel);
			window.removeEventListener('blur', onWindowBlur);
		};
	}, [dragging, finishDrag]);

	const style: React.CSSProperties = {
		...baseStyle,
		right: 0,
		background: 'transparent',
	};

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			title="Drag to change duration"
			style={style}
			onPointerDown={onPointerDown}
		/>
	);
};
