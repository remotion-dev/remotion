import type {NodeWrapper} from '@remotion/studio-shared';
import React, {useCallback, useState} from 'react';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {installRequiredPackages} from '../../helpers/install-required-package';
import {HtmlInCanvasIcon} from '../../icons/html-in-canvas';
import {MotionBlurIcon} from '../../icons/motion-blur';
import {showNotification} from '../Notifications/NotificationCenter';
import {usePrepareHtmlInCanvasWrap} from '../use-prepare-html-in-canvas-wrap';
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
	const prepareWrap = usePrepareHtmlInCanvasWrap();
	const {sequence} = track;
	const [busy, setBusy] = useState(false);
	const isTransition = sequence.timelineTrack?.role === 'transition';
	const canWrapInHtmlInCanvas =
		sequence.type === 'sequence' &&
		!nodePathInfo.supportsEffects &&
		!htmlInCanvasComponentIdentities.has(
			sequence.controls?.componentIdentity ?? '',
		);

	const onWrap = useCallback(
		async (wrapper: HtmlInCanvasWrapper) => {
			if (
				busy ||
				isTransition ||
				!canWrapInHtmlInCanvas ||
				sourceActionsDisabled
			) {
				return;
			}

			setBusy(true);
			try {
				const prepared = await prepareWrap({
					nodePathInfo,
					wrapper,
					effect: null,
					sourceLocation,
				});
				if (prepared === null) return;
				const {compositionId, measuredSize, ...timing} = prepared;
				const nodePath = nodePathInfo.sequenceSubscriptionKey;

				if (wrapper === 'HtmlInCanvasMotionBlur') {
					await installRequiredPackages([
						{name: '@remotion/motion-blur', version: null},
					]);
				}

				const result = await wrapNode({
					fileName: nodePath.absolutePath,
					compositionId,
					nodePath: nodePath.nodePath,
					wrapper,
					measuredSize,
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
			isTransition,
			canWrapInHtmlInCanvas,
			nodePathInfo,
			prepareWrap,
			sourceActionsDisabled,
			sourceLocation,
		],
	);

	if (!canWrapInHtmlInCanvas || sourceActionsDisabled) {
		return null;
	}

	return (
		<>
			<InspectorQuickAction
				disabled={busy || sourceActionsDisabled || isTransition}
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
				disabled={busy || sourceActionsDisabled || isTransition}
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
