import type {NodeWrapper} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals, isHtmlInCanvasSupported, useVideoConfig} from 'remotion';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {installRequiredPackages} from '../../helpers/install-required-package';
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
	readonly sequence: TimelineTrackData['sequence'];
	readonly sourceActionsDisabled: boolean;
	readonly sourceLocation: {
		readonly source: string;
		readonly line: number;
	};
}> = ({nodePathInfo, sequence, sourceActionsDisabled, sourceLocation}) => {
	const {width, height} = useVideoConfig();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {sequences} = useContext(Internals.SequenceManager);
	const nodePathKey = JSON.stringify(nodePathInfo.sequenceSubscriptionKey);
	const sequenceStack = sequence.getStack();
	const eligibilityKey = JSON.stringify([nodePathKey, sequenceStack]);
	const [busy, setBusy] = useState(false);
	const [eligibleNodeKey, setEligibleNodeKey] = useState<string | null>(null);
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
		if (sourceActionsDisabled || wouldNestAtRuntime) {
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
	}, [eligibilityKey, nodePathKey, sourceActionsDisabled, wouldNestAtRuntime]);

	const onWrap = useCallback(
		async (wrapper: HtmlInCanvasWrapper) => {
			if (
				busy ||
				sourceActionsDisabled ||
				wouldNestAtRuntime ||
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
			width,
			wouldNestAtRuntime,
		],
	);

	if (
		sourceActionsDisabled ||
		eligibleNodeKey !== eligibilityKey ||
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
