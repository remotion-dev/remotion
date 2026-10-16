import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {UnwrapIcon} from '../../icons/unwrap';
import {showNotification} from '../Notifications/NotificationCenter';
import {unwrapNode} from '../unwrap-node-api';
import {InspectorQuickAction} from './common';

const iconStyle: React.CSSProperties = {
	display: 'block',
	height: 16,
	width: 16,
};

export const SequenceUnwrapAction: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sourceActionsDisabled: boolean;
}> = ({nodePathInfo, sourceActionsDisabled}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const [canUnwrap, setCanUnwrap] = useState(false);
	const [busy, setBusy] = useState(false);
	const {absolutePath, nodePath} = nodePathInfo.sequenceSubscriptionKey;
	const compositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;

	useEffect(() => {
		let cancelled = false;
		setCanUnwrap(false);
		if (sourceActionsDisabled || compositionId === null) return;
		unwrapNode({fileName: absolutePath, nodePath, compositionId, dryRun: true})
			.then((result) => {
				if (!cancelled) setCanUnwrap(result.success && result.canUnwrap);
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [absolutePath, nodePath, compositionId, sourceActionsDisabled]);

	const onUnwrap = useCallback(async () => {
		if (busy || !canUnwrap || sourceActionsDisabled || compositionId === null)
			return;
		setBusy(true);
		try {
			const result = await unwrapNode({
				fileName: absolutePath,
				nodePath,
				compositionId,
				dryRun: false,
			});
			if (!result.success) showNotification(result.reason, 4000);
		} catch (error) {
			showNotification((error as Error).message, 4000);
		} finally {
			setBusy(false);
		}
	}, [
		absolutePath,
		nodePath,
		compositionId,
		busy,
		canUnwrap,
		sourceActionsDisabled,
	]);

	if (!canUnwrap || sourceActionsDisabled || compositionId === null)
		return null;
	return (
		<InspectorQuickAction
			disabled={busy}
			onClick={onUnwrap}
			aria-label="Unwrap: remove this element and keep its children"
			renderIcon={(color) => <UnwrapIcon color={color} style={iconStyle} />}
		>
			Unwrap
		</InspectorQuickAction>
	);
};
