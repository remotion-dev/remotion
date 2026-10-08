import {getCanvasSequenceReorderSelection} from '@remotion/sdk';
import type {ReorderSequencePosition} from '@remotion/studio-shared';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {
	isPointerSessionRelease,
	startDeferredCapturedPointerSession,
} from '../../helpers/pointer-session';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {showNotification} from '../Notifications/NotificationCenter';
import {reorderSequence} from '../reorder-sequence-api';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';
import {scrollableRef} from './timeline-refs';
import {
	SCROLL_INCREMENT,
	startTimelineEdgeAutoScroll,
} from './timeline-scroll-logic';
import {
	isTimelineSelectionModifierEvent,
	useTimelineSelection,
} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';

const SERIES_REORDER_SEAM_SNAP_DISTANCE = 12;

export const useSeriesReorder = (
	items: readonly TimelineTrackWithDisplayGroup[],
) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const timelineWidth = useContext(TimelineWidthContext);
	const video = Internals.useVideo();
	const {selectedItems} = useTimelineSelection();
	const [dropIndicatorLeft, setDropIndicatorLeft] = useState<number | null>(
		null,
	);
	const stopPointerSession = useRef<(() => void) | null>(null);
	const suppressNextClick = useRef(false);

	useEffect(() => {
		return () => stopPointerSession.current?.();
	}, []);

	const onPointerDownCapture = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (
				e.button !== 0 ||
				!e.isPrimary ||
				isTimelineSelectionModifierEvent(e) ||
				!isStudioInteractivityEnabled() ||
				previewServerState.type !== 'connected' ||
				timelineWidth === null ||
				video === null ||
				!(e.target instanceof Element) ||
				e.target.closest('button, input, textarea, select, [role="separator"]')
			) {
				return;
			}

			const clipElement = e.target.closest<HTMLDivElement>(
				'[data-track-item="clip"]',
			);
			const itemId = clipElement?.closest<HTMLElement>(
				'[data-timeline-track-item-id]',
			)?.dataset.timelineTrackItemId;
			const draggedItem = items.find((item) => item.sequence.id === itemId);
			if (
				!clipElement ||
				!draggedItem?.nodePathInfo ||
				draggedItem.sequence.controls?.componentIdentity !==
					'dev.remotion.remotion.Series.Sequence'
			) {
				return;
			}

			const siblings = items.filter(
				(item) =>
					item.sequence.parent === draggedItem.sequence.parent &&
					item.sequence.controls?.componentIdentity ===
						'dev.remotion.remotion.Series.Sequence',
			);
			const sourceInfos = getCanvasSequenceReorderSelection({
				draggedItem: {type: 'sequence', nodePathInfo: draggedItem.nodePathInfo},
				selectedItems,
			});
			const sourceKeys = sourceInfos.map((info) =>
				Internals.makeSequencePropsSubscriptionKey(
					info.sequenceSubscriptionKey,
				),
			);
			const sourceIndexes = sourceKeys.map((key) =>
				siblings.findIndex(
					(item) =>
						item.nodePathInfo !== null &&
						Internals.makeSequencePropsSubscriptionKey(
							item.nodePathInfo.sequenceSubscriptionKey,
						) === key,
				),
			);
			const fileName =
				draggedItem.nodePathInfo.sequenceSubscriptionKey.absolutePath;
			const frameIncrement =
				(timelineWidth - TIMELINE_PADDING * 2) / video.durationInFrames;
			if (
				!Number.isFinite(frameIncrement) ||
				frameIncrement <= 0 ||
				sourceIndexes.some((index) => index === -1) ||
				sourceInfos.some(
					(info) =>
						info.numberOfSequencesWithThisNodePath !== 1 ||
						info.sequenceSubscriptionKey.absolutePath !== fileName,
				)
			) {
				return;
			}

			stopPointerSession.current?.();
			const trackElement = e.currentTarget;
			const sourceRect = clipElement.getBoundingClientRect();
			const startX = e.clientX;
			const startY = e.clientY;
			let clientX = startX;
			let clientY = startY;
			let didDrag = false;
			let preview: HTMLDivElement | null = null;
			let previousUserSelect = '';
			let previousWebkitUserSelect = '';
			let dropTarget: {
				item: TimelineTrackWithDisplayGroup | null;
				position: ReorderSequencePosition;
				changesOrder: boolean;
			} | null = null;
			const candidates = siblings.flatMap((item, index) =>
				sourceIndexes.includes(index) ? [] : [{item, index}],
			);
			const sources = siblings.filter((_, index) =>
				sourceIndexes.includes(index),
			);

			const updateDropTarget = () => {
				dropTarget = null;
				const rect = trackElement.getBoundingClientRect();
				if (clientY < rect.top || clientY > rect.top + sourceRect.height) {
					setDropIndicatorLeft(null);
					return;
				}

				const pointerLeft = clientX - rect.left;
				let seamIndex: number | null = null;
				let seamLeft: number | null = null;
				let closestDistance = SERIES_REORDER_SEAM_SNAP_DISTANCE;
				// Include the outer edges as well as seams between siblings. Keep selected
				// clips in this search so their original placement remains reachable.
				for (let index = 0; index <= siblings.length; index++) {
					const lastSequence = siblings[siblings.length - 1].sequence;
					const left =
						(index === siblings.length
							? lastSequence.from + lastSequence.duration
							: siblings[index].sequence.from) * frameIncrement;
					const distance = Math.abs(pointerLeft - left);
					if (distance <= closestDistance) {
						seamIndex = index;
						seamLeft = left;
						closestDistance = distance;
					}
				}

				if (seamIndex === null) {
					setDropIndicatorLeft(null);
					return;
				}

				// Once a seam has been reached, the glow supplies the feedback for
				// the rest of the gesture, even if the pointer leaves the seam.
				preview?.remove();
				preview = null;
				const insertionIndex =
					seamIndex - sourceIndexes.filter((index) => index < seamIndex).length;
				const reordered = candidates.map(({item}) => item);
				reordered.splice(insertionIndex, 0, ...sources);
				// Series only permits an unlimited duration on its final clip.
				if (
					reordered
						.slice(0, -1)
						.some(
							(item) =>
								item.sequence.controls?.runtimeValues.getSnapshot()
									.durationInFrames === Infinity,
						)
				) {
					setDropIndicatorLeft(null);
					return;
				}

				const changesOrder = reordered.some(
					(item, index) => item !== siblings[index],
				);
				const next = candidates[insertionIndex];
				const candidate = next ?? candidates.at(-1);
				if (
					changesOrder &&
					(!candidate ||
						candidate.item.nodePathInfo?.numberOfSequencesWithThisNodePath !==
							1 ||
						candidate.item.nodePathInfo.sequenceSubscriptionKey.absolutePath !==
							fileName)
				) {
					setDropIndicatorLeft(null);
					return;
				}

				dropTarget = {
					item: candidate?.item ?? null,
					position: next ? 'before' : 'after',
					changesOrder,
				};
				setDropIndicatorLeft(seamLeft);
			};

			const autoScroll = startTimelineEdgeAutoScroll({
				includeHorizontal: true,
				includeVertical: false,
				verticalTopOffset: 0,
				onTick: ({x}) => {
					if (x === null || !scrollableRef.current) {
						return;
					}

					scrollableRef.current.scrollLeft +=
						x === 'left' ? -SCROLL_INCREMENT : SCROLL_INCREMENT;
					updateDropTarget();
				},
			});
			stopPointerSession.current = startDeferredCapturedPointerSession({
				// The row stays mounted when horizontal scrolling crops the source clip.
				captureTarget: trackElement,
				event: e.nativeEvent,
				onMove: (event, capturePointer) => {
					clientX = event.clientX;
					clientY = event.clientY;
					if (!didDrag && Math.hypot(clientX - startX, clientY - startY) < 3) {
						return;
					}

					if (!didDrag) {
						didDrag = true;
						capturePointer();
						previousUserSelect = document.body.style.userSelect;
						previousWebkitUserSelect = document.body.style.webkitUserSelect;
						document.body.style.userSelect = 'none';
						document.body.style.webkitUserSelect = 'none';
						preview = clipElement.cloneNode(true) as HTMLDivElement;
						preview.setAttribute('aria-hidden', 'true');
						preview.setAttribute('data-series-reorder-preview', 'true');
						Object.assign(preview.style, {
							position: 'fixed',
							left: `${sourceRect.left}px`,
							top: `${sourceRect.top}px`,
							marginLeft: '0',
							width: `${sourceRect.width}px`,
							height: `${sourceRect.height}px`,
							opacity: '0.8',
							pointerEvents: 'none',
							zIndex: '2147483647',
						});
						// Edge handles on the clone must not intercept drop gestures.
						for (const child of preview.querySelectorAll<HTMLElement>('*')) {
							child.style.pointerEvents = 'none';
						}

						document.body.appendChild(preview);
					}

					event.preventDefault();
					if (preview) {
						preview.style.transform = `translateX(${clientX - startX}px)`;
					}

					updateDropTarget();
					autoScroll.update({clientX, clientY});
				},
				onEnd: (reason, event) => {
					const released = isPointerSessionRelease(reason, event);
					if (released && didDrag) {
						clientX = event.clientX;
						clientY = event.clientY;
						updateDropTarget();
					}

					autoScroll.stop();
					preview?.remove();
					setDropIndicatorLeft(null);
					stopPointerSession.current = null;
					if (!didDrag) {
						return;
					}

					document.body.style.userSelect = previousUserSelect;
					document.body.style.webkitUserSelect = previousWebkitUserSelect;
					suppressNextClick.current = true;
					setTimeout(() => {
						suppressNextClick.current = false;
					}, 0);
					if (
						!released ||
						!dropTarget?.changesOrder ||
						!dropTarget.item?.nodePathInfo
					) {
						return;
					}

					reorderSequence({
						fileName,
						sourceNodePaths: sourceInfos.map(
							(info) => info.sequenceSubscriptionKey,
						),
						targetNodePath:
							dropTarget.item.nodePathInfo.sequenceSubscriptionKey,
						position: dropTarget.position,
						clientId: previewServerState.clientId,
					})
						.then((result) => {
							if (!result.success) {
								showNotification(result.reason, 4000);
							}
						})
						.catch((err) => showNotification((err as Error).message, 4000));
				},
			});
		},
		[items, previewServerState, selectedItems, timelineWidth, video],
	);
	const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (suppressNextClick.current) {
			e.preventDefault();
			e.stopPropagation();
			suppressNextClick.current = false;
		}
	}, []);

	return {dropIndicatorLeft, onClickCapture, onPointerDownCapture};
};
