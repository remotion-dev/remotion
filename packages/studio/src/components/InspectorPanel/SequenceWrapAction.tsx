import type {NodeWrapper} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals, isHtmlInCanvasSupported, useVideoConfig} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {installRequiredPackages} from '../../helpers/install-required-package';
import {timelineSequenceNodePathToKey} from '../../helpers/timeline-node-path-key';
import {HtmlInCanvasIcon} from '../../icons/html-in-canvas';
import {MotionBlurIcon} from '../../icons/motion-blur';
import {SetSelectedModalContext} from '../../state/modals';
import {showNotification} from '../Notifications/NotificationCenter';
import {wrapNode} from '../wrap-node-api';
import {
	InspectorQuickAction,
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';

type HtmlInCanvasWrapper = Extract<
	NodeWrapper,
	'HtmlInCanvas' | 'HtmlInCanvasMotionBlur'
>;

const htmlInCanvasComponentIdentities = new Set([
	'dev.remotion.remotion.HtmlInCanvas',
	'dev.remotion.motionBlur.HtmlInCanvasMotionBlur',
]);

export const SequenceWrapAction: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly track: TimelineTrackData;
	readonly sourceActionsDisabled: boolean;
	readonly sourceLocation: {
		readonly source: string;
		readonly line: number;
	};
}> = ({nodePathInfo, track, sourceActionsDisabled, sourceLocation}) => {
	const {width, height} = useVideoConfig();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {sequence} = track;
	const nodePathKey = JSON.stringify(nodePathInfo.sequenceSubscriptionKey);
	const sequenceStack = sequence.getStack();
	const eligibilityKey = JSON.stringify([nodePathKey, sequenceStack]);
	const [busy, setBusy] = useState(false);
	const [eligibleNodeKey, setEligibleNodeKey] = useState<string | null>(null);
	const timing = useMemo(() => {
		const selectedNodePathKey = timelineSequenceNodePathToKey(
			nodePathInfo.sequenceSubscriptionKey,
		);
		const matchingTracks = calculateTimeline({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		}).filter(
			(candidate) =>
				candidate.nodePathInfo !== null &&
				timelineSequenceNodePathToKey(
					candidate.nodePathInfo.sequenceSubscriptionKey,
				) === selectedNodePathKey,
		);
		const timings = matchingTracks.map((candidate) => {
			const from = Math.max(
				0,
				candidate.localStart +
					(candidate.sequence.from - candidate.cascadedStart) *
						candidate.keyframePlaybackRate,
			);
			return {
				from,
				durationInFrames:
					candidate.sequence.duration * candidate.keyframePlaybackRate,
				trimBefore: from,
			};
		});
		const firstTiming = timings[0];
		if (
			!firstTiming ||
			!Number.isFinite(firstTiming.from) ||
			!Number.isFinite(firstTiming.durationInFrames) ||
			firstTiming.durationInFrames <= 0
		) {
			return null;
		}

		for (const candidate of timings.slice(1)) {
			if (
				!Number.isFinite(candidate.from) ||
				!Number.isFinite(candidate.durationInFrames) ||
				candidate.durationInFrames <= 0
			) {
				return null;
			}

			const fromTolerance =
				Number.EPSILON *
				Math.max(1, Math.abs(firstTiming.from), Math.abs(candidate.from)) *
				16;
			const durationTolerance =
				Number.EPSILON *
				Math.max(
					1,
					Math.abs(firstTiming.durationInFrames),
					Math.abs(candidate.durationInFrames),
				) *
				16;
			if (
				Math.abs(firstTiming.from - candidate.from) > fromTolerance ||
				Math.abs(firstTiming.durationInFrames - candidate.durationInFrames) >
					durationTolerance
			) {
				return null;
			}
		}

		return firstTiming;
	}, [
		nodePathInfo.sequenceSubscriptionKey,
		overrideIdToNodePathMappings,
		sequences,
	]);
	const wouldNestAtRuntime = useMemo(() => {
		const sequencesById = new Map(
			sequences.map((registeredSequence) => [
				registeredSequence.id,
				registeredSequence,
			]),
		);
		let ancestorId: string | null = sequence.id;
		while (ancestorId !== null) {
			const ancestor = sequencesById.get(ancestorId);
			if (!ancestor) {
				break;
			}

			if (
				ancestor.controls?.componentIdentity &&
				htmlInCanvasComponentIdentities.has(ancestor.controls.componentIdentity)
			) {
				return true;
			}

			ancestorId = ancestor.parent;
		}

		for (const registeredSequence of sequences) {
			if (
				!registeredSequence.controls?.componentIdentity ||
				!htmlInCanvasComponentIdentities.has(
					registeredSequence.controls.componentIdentity,
				)
			) {
				continue;
			}

			let descendantParentId = registeredSequence.parent;
			while (descendantParentId !== null) {
				if (descendantParentId === sequence.id) {
					return true;
				}

				descendantParentId =
					sequencesById.get(descendantParentId)?.parent ?? null;
			}
		}

		return false;
	}, [sequence.id, sequences]);

	useEffect(() => {
		if (sourceActionsDisabled || wouldNestAtRuntime || timing === null) {
			setEligibleNodeKey(null);
			return;
		}

		let cancelled = false;
		setEligibleNodeKey(null);
		const nodePath = JSON.parse(
			nodePathKey,
		) as SequenceNodePathInfo['sequenceSubscriptionKey'];
		wrapNode({
			fileName: nodePath.absolutePath,
			nodePath: nodePath.nodePath,
			wrapper: null,
			width: null,
			height: null,
			timing: null,
		})
			.then((eligibility) => {
				if (!cancelled) {
					setEligibleNodeKey(
						eligibility.success && eligibility.canWrapHtmlInCanvas
							? eligibilityKey
							: null,
					);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setEligibleNodeKey(null);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [
		eligibilityKey,
		nodePathKey,
		sourceActionsDisabled,
		timing,
		wouldNestAtRuntime,
	]);

	const onWrap = useCallback(
		async (wrapper: HtmlInCanvasWrapper) => {
			if (
				busy ||
				sourceActionsDisabled ||
				wouldNestAtRuntime ||
				timing === null ||
				eligibleNodeKey !== eligibilityKey
			) {
				return;
			}

			if (!isHtmlInCanvasSupported()) {
				setSelectedModal({
					type: 'html-in-canvas-unavailable',
					action:
						wrapper === 'HtmlInCanvasMotionBlur' ? 'motion-blur' : 'effects',
				});
				return;
			}

			setBusy(true);
			const nodePath = JSON.parse(
				nodePathKey,
			) as SequenceNodePathInfo['sequenceSubscriptionKey'];
			try {
				const eligibility = await wrapNode({
					fileName: nodePath.absolutePath,
					nodePath: nodePath.nodePath,
					wrapper: null,
					width: null,
					height: null,
					timing: null,
				});
				if (!eligibility.success) {
					showNotification(eligibility.reason, 4000);
					return;
				}

				if (!eligibility.canWrap) {
					setSelectedModal({
						type: 'wrap-refactor',
						displayName:
							sequence.displayName || sequence.controls?.componentName || null,
						location: sourceLocation,
						wrapper,
					});
					return;
				}

				if (!eligibility.canWrapHtmlInCanvas) {
					showNotification('HTML-in-canvas components cannot be nested.', 4000);
					setEligibleNodeKey(null);
					return;
				}

				if (wrapper === 'HtmlInCanvasMotionBlur') {
					await installRequiredPackages([
						{name: '@remotion/motion-blur', version: null},
					]);
				}

				const result = await wrapNode({
					fileName: nodePath.absolutePath,
					nodePath: nodePath.nodePath,
					wrapper,
					width,
					height,
					timing,
				});
				if (!result.success) {
					showNotification(result.reason, 4000);
				}
			} catch (error) {
				showNotification((error as Error).message, 4000);
			} finally {
				setBusy(false);
			}
		},
		[
			busy,
			eligibilityKey,
			eligibleNodeKey,
			height,
			nodePathKey,
			sequence.controls?.componentName,
			sequence.displayName,
			setSelectedModal,
			sourceActionsDisabled,
			sourceLocation,
			timing,
			width,
			wouldNestAtRuntime,
		],
	);

	if (
		sourceActionsDisabled ||
		eligibleNodeKey !== eligibilityKey ||
		timing === null ||
		wouldNestAtRuntime
	) {
		return null;
	}

	return (
		<>
			<InspectorQuickAction
				disabled={busy || sourceActionsDisabled}
				iconContainerStyle={largeInspectorActionIconContainerStyle}
				onClick={() => onWrap('HtmlInCanvas')}
				renderIcon={(color) => (
					<HtmlInCanvasIcon
						color={color}
						style={largeInspectorActionIconStyle}
						viewBox="-64 -80 704 704"
					/>
				)}
			>
				HTML-in-canvas
			</InspectorQuickAction>
			<InspectorQuickAction
				disabled={busy || sourceActionsDisabled}
				iconContainerStyle={largeInspectorActionIconContainerStyle}
				onClick={() => onWrap('HtmlInCanvasMotionBlur')}
				renderIcon={(color) => (
					<MotionBlurIcon color={color} style={largeInspectorActionIconStyle} />
				)}
			>
				Motion blur
			</InspectorQuickAction>
		</>
	);
};
