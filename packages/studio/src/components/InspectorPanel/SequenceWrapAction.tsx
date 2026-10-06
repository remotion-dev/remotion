import type {NodeWrapper} from '@remotion/studio-shared';
import React, {useCallback, useContext, useState} from 'react';
import {Internals, isHtmlInCanvasSupported} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {installRequiredPackages} from '../../helpers/install-required-package';
import {HtmlInCanvasIcon} from '../../icons/html-in-canvas';
import {MotionBlurIcon} from '../../icons/motion-blur';
import {SetSelectedModalContext} from '../../state/modals';
import {showNotification} from '../Notifications/NotificationCenter';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {getCurrentDimensions} from '../Timeline/imperative-state';
import {wrapNode} from '../wrap-node-api';
import {
	InspectorQuickAction,
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';
import {getHtmlInCanvasWrapperTiming} from './get-html-in-canvas-wrapper-timing';

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
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const {sequence} = track;
	const [busy, setBusy] = useState(false);

	const onWrap = useCallback(
		async (wrapper: HtmlInCanvasWrapper) => {
			if (busy || sourceActionsDisabled) {
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

			const sequences = sequencesRef.current;
			const overrideIdToNodePathMappings =
				overrideIdToNodePathMappingsRef.current;
			const {width, height} = getCurrentDimensions();
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
					htmlInCanvasComponentIdentities.has(
						ancestor.controls.componentIdentity,
					)
				) {
					showNotification('HTML-in-canvas components cannot be nested.', 4000);
					return;
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
						showNotification(
							'HTML-in-canvas components cannot be nested.',
							4000,
						);
						return;
					}

					descendantParentId =
						sequencesById.get(descendantParentId)?.parent ?? null;
				}
			}

			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const timing = getHtmlInCanvasWrapperTiming({
				tracks: calculateTimeline({
					sequences,
					overrideIdsToNodePaths: overrideIdToNodePathMappings,
				}),
				sequenceSubscriptionKey: nodePath,
			});
			setBusy(true);
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

				if (eligibility.canWrap && !eligibility.canWrapHtmlInCanvas) {
					showNotification('HTML-in-canvas components cannot be nested.', 4000);
					return;
				}

				if (!eligibility.canWrap || timing === null) {
					setSelectedModal({
						type: 'wrap-refactor',
						displayName:
							sequence.displayName || sequence.controls?.componentName || null,
						location: sourceLocation,
						wrapper,
					});
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
			nodePathInfo.sequenceSubscriptionKey,
			overrideIdToNodePathMappingsRef,
			sequence.controls?.componentName,
			sequence.displayName,
			sequence.id,
			sequencesRef,
			setSelectedModal,
			sourceActionsDisabled,
			sourceLocation,
		],
	);

	if (sourceActionsDisabled) {
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
						viewBox="-48 -64 704 704"
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
