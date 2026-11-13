import {
	REACT_REFRESH_FINISHED_EVENT,
	type InsertableCompositionElement,
	type ReorderSequenceRequest,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {
	BLUE,
	RED,
	TIMELINE_DROP_BLUE_ALPHA_16,
	WHITE,
} from '../../helpers/colors';
import {getTimelineNaturalMediaDuration} from '../../helpers/get-timeline-natural-media-duration';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {isVideoWithLastFrameHold} from '../../helpers/is-video-with-last-frame-hold';
import {getPendingSequenceNodePathMutations} from '../../helpers/sequence-node-path-mutations';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {getCachedMediaMetadata} from '../../helpers/use-media-metadata';
import {insertCompositionElement} from '../import-assets';
import {showNotification} from '../Notifications/NotificationCenter';
import {reorderSequence} from '../reorder-sequence-api';
import {
	scrollableRef,
	timelineRulerRef,
	timelineVerticalScroll,
	timelineViewportRef,
} from './timeline-refs';
import {getTimelineContentWidth} from './timeline-scroll-logic';

export type TrackDropTarget = {element: HTMLElement; track: TimelineTrackData};

export const getTrackDropTarget = (
	clientX: number,
	clientY: number,
	tracks: readonly TimelineTrackData[],
): TrackDropTarget | null => {
	const scrollable = scrollableRef.current;
	const timeline = timelineVerticalScroll.current;
	const timelineViewport = timelineViewportRef.current;
	if (!scrollable || !timeline || !timelineViewport) return null;
	const viewport = scrollable.getBoundingClientRect();
	const visible = timeline.getBoundingClientRect();
	const bounds = timelineViewport.getBoundingClientRect();
	const ruler = timelineRulerRef.current?.getBoundingClientRect();
	const left = Math.max(
		viewport.left + scrollable.clientLeft,
		visible.left + timeline.clientLeft,
		bounds.left + timelineViewport.clientLeft,
	);
	const top = Math.max(
		viewport.top + scrollable.clientTop,
		visible.top + timeline.clientTop,
		bounds.top + timelineViewport.clientTop,
		ruler?.bottom ?? -Infinity,
	);
	const right = Math.min(
		viewport.left + scrollable.clientLeft + scrollable.clientWidth,
		visible.left + timeline.clientLeft + timeline.clientWidth,
		bounds.left + timelineViewport.clientLeft + timelineViewport.clientWidth,
	);
	const bottom = Math.min(
		viewport.top + scrollable.clientTop + scrollable.clientHeight,
		visible.top + timeline.clientTop + timeline.clientHeight,
		bounds.top + timelineViewport.clientTop + timelineViewport.clientHeight,
	);
	if (clientX < left || clientX >= right || clientY < top || clientY >= bottom)
		return null;
	const element = Array.from(
		document.querySelectorAll<HTMLElement>('[data-track-drop-target]'),
	).find((candidate) => {
		const rect = candidate.getBoundingClientRect();
		return clientY >= rect.top && clientY < rect.bottom;
	});
	if (!element) return null;
	const track = tracks.find(
		(item) => item.sequence.id === element.dataset.trackDropTarget,
	);
	return track ? {element, track} : null;
};

export const getTrackClipDuration = (track: TimelineTrackData, fps: number) => {
	const {sequence} = track;
	if (sequence.loopDisplay)
		return (
			sequence.loopDisplay.durationInFrames * sequence.loopDisplay.numberOfTimes
		);
	if (isVideoWithLastFrameHold(sequence)) return sequence.duration;
	if (sequence.type !== 'video' && sequence.type !== 'audio')
		return sequence.duration;
	const natural = getTimelineNaturalMediaDuration({
		sequence,
		fps,
		sequenceFrameOffset: track.sequenceFrameOffset,
		mediaMetadata: getCachedMediaMetadata(sequence.src),
	});
	return Math.min(sequence.duration, natural ?? sequence.duration);
};

const waitForTrackSourceRefresh = async (absolutePath: string) => {
	const isPending = () =>
		getPendingSequenceNodePathMutations().some(
			(mutation) =>
				!mutation.applyWithoutFastRefresh &&
				mutation.files.some((file) => file.absolutePath === absolutePath),
		);
	if (!isPending()) return;
	await new Promise<void>((resolve) => {
		const cleanup = () => {
			window.removeEventListener(REACT_REFRESH_FINISHED_EVENT, finish);
			clearTimeout(timeout);
			resolve();
		};

		const finish = () => {
			if (!isPending()) cleanup();
		};

		const timeout = setTimeout(cleanup, 5000);
		window.addEventListener(REACT_REFRESH_FINISHED_EVENT, finish);
	});
};

export const isTrackDropValid = ({
	target,
	tracks,
	spans,
	excludedIds,
	fps,
}: {
	target: TrackDropTarget;
	tracks: readonly TimelineTrackData[];
	spans: readonly {from: number; duration: number}[];
	excludedIds: ReadonlySet<string>;
	fps: number;
}) => {
	const {track} = target;
	if (
		getPendingSequenceNodePathMutations().some(
			(mutation) =>
				!mutation.applyWithoutFastRefresh &&
				mutation.files.some(
					(file) =>
						file.absolutePath ===
						track.nodePathInfo?.sequenceSubscriptionKey.absolutePath,
				),
		)
	)
		return false;
	if (
		!track.nodePathInfo ||
		track.nodePathInfo.numberOfSequencesWithThisNodePath !== 1 ||
		track.sequence.controls?.componentIdentity !==
			'dev.remotion.remotion.Track' ||
		track.sequence.loopDisplay ||
		track.sequence.frozenFrame !== null
	)
		return false;
	const start = track.sequence.from;
	const end = start + track.sequence.duration;
	const occupied = tracks
		.filter(
			({sequence}) =>
				sequence.timelineTrack?.role === 'clip' &&
				sequence.timelineTrack.id === track.sequence.timelineTrack?.id &&
				(sequence.showInTimeline || sequence.type !== 'sequence') &&
				!excludedIds.has(sequence.id),
		)
		.map((item) => ({
			from: item.sequence.from + (item.sequence.loopDisplay?.startOffset ?? 0),
			duration: getTrackClipDuration(item, fps),
		}));
	return spans.every(
		(span, index) =>
			Number.isFinite(span.from) &&
			Number.isFinite(span.duration) &&
			span.duration > 0 &&
			span.from >= start - 0.00001 &&
			span.from + span.duration <= end + 0.00001 &&
			[...occupied, ...spans.slice(0, index)].every(
				(other) =>
					span.from + span.duration <= other.from + 0.00001 ||
					other.from + other.duration <= span.from + 0.00001,
			),
	);
};

const trackPreviewOwners = new WeakMap<
	HTMLElement,
	{owner: object; originalDisplay: string; originalColor: string}
>();

export const createTrackDropPreview = (durationInFrames: number) => {
	const owner = {};
	let targetOutline: HTMLElement | null = null;
	const ghost = document.createElement('div');
	ghost.dataset.timelineTrackDropPreview = '';
	ghost.setAttribute('aria-hidden', 'true');
	Object.assign(ghost.style, {
		position: 'absolute',
		pointerEvents: 'none',
		borderRadius: '3px',
		border: '1px solid',
		boxSizing: 'border-box',
		opacity: '0.7',
	});
	const clear = () => {
		if (targetOutline) {
			const current = trackPreviewOwners.get(targetOutline);
			if (current?.owner === owner) {
				targetOutline.style.setProperty(
					'--remotion-track-drop-display',
					current.originalDisplay,
				);
				targetOutline.style.setProperty(
					'--remotion-track-drop-color',
					current.originalColor,
				);
				trackPreviewOwners.delete(targetOutline);
			}
		}

		targetOutline = null;
		ghost.remove();
	};

	return {
		clear,
		show: (
			target: TrackDropTarget,
			from: number,
			duration: number,
			valid: boolean,
		) => {
			const previewContainer = target.element.querySelector<HTMLElement>(
				'[data-track-drop-preview-container]',
			);
			if (!previewContainer) {
				clear();
				return;
			}

			const outline = target.element.querySelector<HTMLElement>(
				'[data-track-drop-outline]',
			);
			if (targetOutline !== outline) {
				clear();
				targetOutline = outline;
				if (targetOutline) {
					const previous = trackPreviewOwners.get(targetOutline);
					trackPreviewOwners.set(targetOutline, {
						owner,
						originalDisplay:
							previous?.originalDisplay ??
							targetOutline.style.getPropertyValue(
								'--remotion-track-drop-display',
							),
						originalColor:
							previous?.originalColor ??
							targetOutline.style.getPropertyValue(
								'--remotion-track-drop-color',
							),
					});
				}
			}

			const color = valid ? BLUE : RED;
			targetOutline?.style.setProperty(
				'--remotion-track-drop-display',
				'contents',
			);
			targetOutline?.style.setProperty(
				'--remotion-track-drop-color',
				valid ? WHITE : RED,
			);
			const outlineBounds =
				targetOutline?.firstElementChild?.getBoundingClientRect() ?? null;
			const row = outlineBounds ?? target.element.getBoundingClientRect();
			const scrollable = scrollableRef.current;
			if (!scrollable) return;
			const contentWidth = getTimelineContentWidth() - TIMELINE_PADDING * 2;
			previewContainer.style.width = `${contentWidth}px`;
			const pxPerFrame = contentWidth / durationInFrames;
			const viewport = scrollable.getBoundingClientRect();
			const previewBounds = previewContainer.getBoundingClientRect();
			const left =
				viewport.left +
				TIMELINE_PADDING +
				from * pxPerFrame -
				scrollable.scrollLeft;
			const previewLeft = Math.max(
				left,
				outlineBounds ? outlineBounds.left + 2 : -Infinity,
			);
			const previewRight = Math.min(
				left + duration * pxPerFrame,
				outlineBounds ? outlineBounds.right - 2 : Infinity,
			);
			Object.assign(ghost.style, {
				left: `${previewLeft - previewBounds.left}px`,
				top: `${row.top + 2 - previewBounds.top}px`,
				width: `${Math.max(2, previewRight - previewLeft)}px`,
				height: `${Math.max(4, Math.min(row.height - 4, 30))}px`,
				borderColor: color,
				backgroundColor: valid
					? TIMELINE_DROP_BLUE_ALPHA_16
					: `color-mix(in srgb, ${RED} 40%, transparent)`,
			});
			if (ghost.parentElement !== previewContainer)
				previewContainer.appendChild(ghost);
		},
	};
};

export const insertElementIntoTimelineTrack = async ({
	target,
	tracks,
	element,
	from,
	fps,
	compositionFile,
	compositionId,
}: {
	target: TrackDropTarget;
	tracks: readonly TimelineTrackData[];
	element: InsertableCompositionElement;
	from: number;
	fps: number;
	compositionFile: string;
	compositionId: string;
}) => {
	if (
		(element.type !== 'asset' && element.type !== 'solid') ||
		!target.track.nodePathInfo
	)
		throw new Error('Unsupported element for a Track');
	const rate = target.track.sequence.sequencePlaybackRate;
	const duration =
		element.type === 'solid' || element.durationInFrames === null
			? Math.min(
					fps * 5,
					(target.track.sequence.from + target.track.sequence.duration - from) *
						rate,
				)
			: Math.min(
					element.durationInFrames,
					(target.track.sequence.from + target.track.sequence.duration - from) *
						rate,
				);
	if (
		!isTrackDropValid({
			target,
			tracks,
			spans: [{from, duration: duration / rate}],
			excludedIds: new Set(),
			fps,
		})
	)
		throw new Error(
			'This item would overlap another clip or extend outside the Track',
		);
	const request = {
		compositionFile,
		compositionId,
		element,
		from:
			(from - target.track.cascadedStart) * rate +
			(target.track.sequence.trimBefore ?? 0),
		track: {
			targetNodePath: target.track.nodePathInfo.sequenceSubscriptionKey,
			durationInFrames: duration,
		},
	};
	const success = await insertCompositionElement(request);
	if (!success) return false;
	await waitForTrackSourceRefresh(
		target.track.nodePathInfo.sequenceSubscriptionKey.absolutePath,
	);
	return true;
};

export const createTrackMove = ({
	tracks,
	sources,
	fps,
	durationInFrames,
	clientId,
	snappingEnabled,
}: {
	tracks: readonly TimelineTrackData[];
	sources: readonly SequencePropsSubscriptionKey[];
	fps: number;
	durationInFrames: number;
	clientId: string;
	snappingEnabled: boolean;
}) => {
	const items = sources.map((source) =>
		tracks.find(
			(track) =>
				track.nodePathInfo?.sequenceSubscriptionKey.absolutePath ===
					source.absolutePath &&
				JSON.stringify(track.nodePathInfo.sequenceSubscriptionKey.nodePath) ===
					JSON.stringify(source.nodePath),
		),
	);
	if (
		items.length === 0 ||
		items.some(
			(item) =>
				!item?.nodePathInfo ||
				item.nodePathInfo.numberOfSequencesWithThisNodePath !== 1 ||
				(item.sequence.timelineTrack !== undefined &&
					(item.sequence.timelineTrack.role !== 'clip' ||
						item.sequence.timelineTrack.seriesOffset !== null)) ||
				item.sequence.loopDisplay ||
				item.sequence.frozenFrame !== null,
		)
	)
		return null;
	const moving = items as TimelineTrackData[];
	const byId = new Map(tracks.map((track) => [track.sequence.id, track]));
	const excludedIds = new Set(
		tracks
			.filter((track) => {
				let current: TimelineTrackData | undefined = track;
				while (current) {
					if (moving.includes(current)) return true;
					current =
						current.sequence.parent === null
							? undefined
							: byId.get(current.sequence.parent);
				}

				return false;
			})
			.map(({sequence}) => sequence.id),
	);
	const preview = createTrackDropPreview(durationInFrames);
	let active = false;
	let request: ReorderSequenceRequest | null = null;
	return {
		get active() {
			return active;
		},
		cancel: preview.clear,
		update: (clientX: number, clientY: number, delta: number) => {
			const target = getTrackDropTarget(clientX, clientY, tracks);
			if (
				!active &&
				(!target ||
					moving.every(
						(item) =>
							item.sequence.timelineTrack?.id ===
							target.track.sequence.timelineTrack?.id,
					))
			)
				return false;
			active = true;
			request = null;
			if (!target) {
				preview.clear();
				return true;
			}

			if (snappingEnabled && delta !== 0) {
				const pxPerFrame =
					(getTimelineContentWidth() - TIMELINE_PADDING * 2) / durationInFrames;
				const boundaries = [
					target.track.sequence.from,
					...tracks
						.filter(
							(item) =>
								item.sequence.timelineTrack?.id ===
									target.track.sequence.timelineTrack?.id &&
								item.sequence.timelineTrack?.role === 'clip' &&
								!excludedIds.has(item.sequence.id),
						)
						.flatMap((item) => [
							item.sequence.from,
							item.sequence.from + getTrackClipDuration(item, fps),
						]),
				];
				let snapDistance = 8 / pxPerFrame;
				let correction = 0;
				for (const item of moving) {
					for (const edge of [
						item.sequence.from + delta,
						item.sequence.from + delta + getTrackClipDuration(item, fps),
					]) {
						for (const boundary of boundaries) {
							if (Math.abs(boundary - edge) < snapDistance) {
								snapDistance = Math.abs(boundary - edge);
								correction = boundary - edge;
							}
						}
					}
				}

				delta += correction;
			}

			const spans = moving.map((item) => ({
				from: item.sequence.from + delta,
				duration: getTrackClipDuration(item, fps),
			}));
			const key = target.track.nodePathInfo?.sequenceSubscriptionKey;
			const valid =
				key !== undefined &&
				!excludedIds.has(target.track.sequence.id) &&
				sources.every((source) => source.absolutePath === key.absolutePath) &&
				isTrackDropValid({target, tracks, spans, excludedIds, fps});
			preview.show(target, spans[0].from, spans[0].duration, valid);
			if (valid && key) {
				const rate = target.track.sequence.sequencePlaybackRate;
				request = {
					fileName: key.absolutePath,
					sourceNodePaths: [...sources],
					targetNodePath: key,
					clientId,
					position: 'inside',
					timings: moving.map((item, index) => ({
						from:
							(spans[index].from - target.track.cascadedStart) * rate +
							(target.track.sequence.trimBefore ?? 0),
						durationInFrames: spans[index].duration * rate,
						playbackRate: item.keyframePlaybackRate / rate,
						trimBefore: Math.max(
							0,
							item.localStart +
								(item.sequence.from - item.cascadedStart) *
									item.keyframePlaybackRate,
						),
						name: item.sequence.displayName,
					})),
				};
			}

			return true;
		},
		commit: async () => {
			if (!request) {
				preview.clear();
				return;
			}

			const notification = showNotification('Moving into Track...', null);
			try {
				const result = await reorderSequence(request);
				if (!result.success) throw new Error(result.reason);
				await waitForTrackSourceRefresh(request.fileName);
			} catch (error) {
				showNotification(
					error instanceof Error ? error.message : String(error),
					4000,
				);
			} finally {
				notification.dismiss();
				preview.clear();
			}
		},
	};
};
