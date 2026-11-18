import type {EffectDefinition, NodeWrapper} from '@remotion/studio-shared';
import {useCallback, useContext} from 'react';
import {Internals, isHtmlInCanvasSupported, type TSequence} from 'remotion';
import {useTimelineCalculator} from '../helpers/calculate-timeline';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {SetSelectedModalContext} from '../state/modals';
import {getHtmlInCanvasWrapperTiming} from './InspectorPanel/get-html-in-canvas-wrapper-timing';
import {showNotification} from './Notifications/NotificationCenter';
import {OverrideIdToNodePathMappingsRefContext} from './SequencePropsSubscriptionProvider';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
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
				timing: null,
			});
			if (!eligibility.success) {
				throw new Error(eligibility.reason);
			}

			if (eligibility.canvasWrapBlocker === 'nested') {
				showNotification('HTML-in-canvas components cannot be nested.', 4000);
				return null;
			}

			if (
				!eligibility.canWrap ||
				eligibility.canvasWrapBlocker === 'unknown-dimensions' ||
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

			return {compositionId, ...timing};
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
