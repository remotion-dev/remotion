import {
	stringifySequenceExpandedRowKey,
	type EffectDefinition,
	type MeasuredCanvasSize,
	type NodeWrapper,
} from '@remotion/studio-shared';
import {useCallback, useContext} from 'react';
import {Internals, isHtmlInCanvasSupported, type TSequence} from 'remotion';
import {useTimelineCalculator} from '../helpers/calculate-timeline';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {SetSelectedModalContext} from '../state/modals';
import {getHtmlInCanvasWrapperTiming} from './InspectorPanel/get-html-in-canvas-wrapper-timing';
import {showNotification} from './Notifications/NotificationCenter';
import {OverrideIdToNodePathMappingsRefContext} from './SequencePropsSubscriptionProvider';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
import {getCurrentFrame} from './Timeline/imperative-state';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
import {wrapNode} from './wrap-node-api';

type HtmlInCanvasWrapper = Extract<
	NodeWrapper,
	'HtmlInCanvas' | 'HtmlInCanvasMotionBlur'
>;

const htmlInCanvasComponentIdentities = new Set([
	'dev.remotion.remotion.HtmlInCanvas',
	'dev.remotion.motionBlur.HtmlInCanvasMotionBlur',
]);

export const canApplyEffects = (
	sequence: TSequence,
	nodePathInfo: SequenceNodePathInfo | null,
) =>
	nodePathInfo !== null &&
	sequence.type !== 'audio' &&
	sequence.timelineTrack?.role !== 'transition';

const occupiesOwnLines = (element: HTMLElement) => {
	const fragments = Array.from(element.getClientRects()).filter(
		(rect) => rect.width > 0 && rect.height > 0,
	);
	const first = fragments[0];
	const last = fragments.at(-1);
	if (!first || !last || last.top <= first.top) {
		return false;
	}

	let container = element.parentElement;
	while (container) {
		const {display} = getComputedStyle(container);
		if (display !== 'inline' && display !== 'contents') {
			break;
		}

		container = container.parentElement;
	}

	if (!container) {
		return false;
	}

	const range = element.ownerDocument.createRange();
	const sharesEdgeLine = () =>
		Array.from(range.getClientRects()).some(
			(rect) =>
				rect.width > 0 &&
				rect.height > 0 &&
				[first, last].some(
					(line) => rect.top < line.bottom && rect.bottom > line.top,
				),
		);
	range.selectNodeContents(container);
	range.setEndBefore(element);
	if (sharesEdgeLine()) {
		return false;
	}

	range.selectNodeContents(container);
	range.setStartAfter(element);
	return !sharesEdgeLine();
};

const measureCanvasSize = (
	ref: NonNullable<TSequence['refForOutline']>,
): MeasuredCanvasSize | null => {
	const nodes = Internals.SequenceOutlineInternals.getNodes(ref);
	const element =
		nodes === null ? ref.current : nodes.length === 1 ? nodes[0] : null;
	if (!element?.isConnected || !(element instanceof HTMLElement)) {
		return null;
	}

	const {display, verticalAlign, visibility, writingMode} =
		getComputedStyle(element);
	const {offsetWidth, offsetHeight} = element;
	if (visibility !== 'visible' || offsetWidth <= 0 || offsetHeight <= 0) {
		return null;
	}

	const canvasDisplay =
		display === 'inline'
			? 'inline'
			: display.startsWith('inline-')
				? 'inline-block'
				: 'block';
	let canvasVerticalAlign: string | null = null;
	if (canvasDisplay !== 'block' && verticalAlign !== 'baseline') {
		canvasVerticalAlign = verticalAlign;
	} else if (
		canvasDisplay === 'inline' &&
		writingMode === 'horizontal-tb' &&
		element.style.verticalAlign !== 'baseline' &&
		occupiesOwnLines(element)
	) {
		canvasVerticalAlign = 'top';
	}

	return {
		// offsetWidth rounds to a whole pixel. Leave room for the fraction so
		// placing an inline fragment in the canvas does not break its line.
		width: display === 'inline' ? offsetWidth + 1 : offsetWidth,
		height: offsetHeight,
		display: canvasDisplay,
		verticalAlign: canvasVerticalAlign,
	};
};

export const usePrepareHtmlInCanvasWrap = () => {
	const calculateTimeline = useTimelineCalculator();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);

	return useCallback(
		async ({
			nodePathInfo,
			wrapper,
			effect,
			sourceLocation,
		}: {
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly wrapper: HtmlInCanvasWrapper;
			readonly effect: EffectDefinition | null;
			readonly sourceLocation: {source: string; line: number} | null;
		}) => {
			const {canvasContent} = compositionManagerRef.current;
			if (canvasContent?.type !== 'composition') {
				return null;
			}

			if (!isHtmlInCanvasSupported()) {
				setSelectedModal({
					type: 'html-in-canvas-unavailable',
					action:
						wrapper === 'HtmlInCanvasMotionBlur' ? 'motion-blur' : 'effects',
				});
				return null;
			}

			const sequences = sequencesRef.current;
			const {tracks} = calculateTimeline({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
			});
			const track = findTrackForNodePathInfo({tracks, nodePathInfo});
			if (!track || !canApplyEffects(track.sequence, nodePathInfo)) {
				return null;
			}

			const sequencesById = new Map(
				sequences.map((sequence) => [sequence.id, sequence]),
			);
			for (const sequence of sequences) {
				if (
					!htmlInCanvasComponentIdentities.has(
						sequence.controls?.componentIdentity ?? '',
					)
				) {
					continue;
				}

				for (const [start, target] of [
					[track.sequence.id, sequence.id],
					[sequence.id, track.sequence.id],
				]) {
					let id: string | null = start;
					while (id !== null) {
						if (id === target) {
							showNotification(
								'HTML-in-canvas components cannot be nested.',
								4000,
							);
							return null;
						}

						id = sequencesById.get(id)?.parent ?? null;
					}
				}
			}

			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const timing = getHtmlInCanvasWrapperTiming({
				tracks,
				sequenceSubscriptionKey: nodePath,
			});
			const {compositionId} = canvasContent;
			const eligibility = await wrapNode({
				fileName: nodePath.absolutePath,
				compositionId,
				nodePath: nodePath.nodePath,
				wrapper: null,
				measuredSize: null,
				timing: null,
			});
			if (!eligibility.success) {
				throw new Error(eligibility.reason);
			}

			if (eligibility.canvasWrapBlocker === 'nested') {
				showNotification('HTML-in-canvas components cannot be nested.', 4000);
				return null;
			}

			let measuredSize: MeasuredCanvasSize | null = null;
			if (eligibility.canvasWrapBlocker === 'unknown-dimensions') {
				const {from, duration, refForOutline} = track.sequence;
				const frame = getCurrentFrame();
				const sourceKey = stringifySequenceExpandedRowKey(nodePath);
				const hasOtherInstances = tracks.some(
					(candidate) =>
						candidate !== track &&
						candidate.nodePathInfo !== null &&
						stringifySequenceExpandedRowKey(
							candidate.nodePathInfo.sequenceSubscriptionKey,
						) === sourceKey,
				);
				if (
					refForOutline !== null &&
					frame >= from &&
					frame < from + duration &&
					!hasOtherInstances
				) {
					measuredSize = measureCanvasSize(refForOutline);
				}
			}

			if (
				!eligibility.canWrap ||
				(eligibility.canvasWrapBlocker === 'unknown-dimensions' &&
					measuredSize === null) ||
				timing === null
			) {
				const stack = track.sequence.getStack();
				const location =
					sourceLocation ??
					(stack
						? await getOriginalLocationFromStack(stack, 'sequence')
						: null);
				if (!location?.source || location.line === null) {
					throw new Error('Could not locate the element to wrap.');
				}

				setSelectedModal({
					type: 'wrap-refactor',
					displayName:
						track.sequence.displayName ||
						track.sequence.controls?.componentName ||
						null,
					location: {source: location.source, line: location.line},
					wrapper,
					effect,
				});
				return null;
			}

			return {compositionId, measuredSize, ...timing};
		},
		[
			calculateTimeline,
			compositionManagerRef,
			overrideIdToNodePathMappingsRef,
			sequencesRef,
			setSelectedModal,
		],
	);
};
