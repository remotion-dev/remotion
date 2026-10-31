import type {PrerenderedSceneInfoResponse} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {subscribeToPreviewServerEvents} from '../../helpers/preview-server-events';
import {UndoIcon} from '../../icons/undo';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {useStaticFiles} from '../use-static-files';
import {InspectorQuickAction} from './common';

const iconStyle: React.CSSProperties = {
	display: 'block',
	height: 14,
	width: 14,
};

// For a <Video> that replaced a scene: brings the scene back, and tells
// whether the scene was edited since it was pre-rendered.
export const PrerenderedVideoActions: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly src: string;
	readonly sourceActionsDisabled: boolean;
}> = ({nodePathInfo, src, sourceActionsDisabled}) => {
	const staticFiles = useStaticFiles();
	const [info, setInfo] = useState<PrerenderedSceneInfoResponse | null>(null);
	const [busy, setBusy] = useState(false);

	const staticFile = staticFiles.find((file) => file.src === src) ?? null;
	const sidecar = useMemo(() => {
		if (staticFile === null) {
			return null;
		}

		return (
			staticFiles.find((file) => file.name === `${staticFile.name}.json`) ??
			null
		);
	}, [staticFile, staticFiles]);

	// Edits to the scene trigger a rebuild, after which it may be out of date
	const [buildHash, setBuildHash] = useState<string | null>(null);
	useEffect(() => {
		return subscribeToPreviewServerEvents((event) => {
			if (event.type === 'hmr' && event.hmrEvent.action === 'built') {
				setBuildHash(event.hmrEvent.hash ?? null);
			}
		});
	}, []);

	const publicPath = staticFile?.name ?? null;
	const sidecarLastModified = sidecar?.lastModified ?? null;
	useEffect(() => {
		if (publicPath === null || sidecarLastModified === null) {
			setInfo(null);
			return;
		}

		let cancelled = false;
		callApi('/api/prerendered-scene-info', {src: publicPath})
			.then((response) => {
				if (!cancelled) {
					setInfo(response);
				}
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [publicPath, sidecarLastModified, buildHash]);

	const onRestore = useCallback(() => {
		if (publicPath === null) {
			return;
		}

		setBusy(true);
		callApi('/api/restore-prerendered-scene', {
			fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
			nodePath: nodePathInfo.sequenceSubscriptionKey.nodePath,
			src: publicPath,
		})
			.then((response) => {
				if (!response.success) {
					throw new Error(response.reason);
				}
			})
			.catch((error) => {
				showNotification((error as Error).message, 4000);
			})
			.finally(() => setBusy(false));
	}, [nodePathInfo, publicPath]);

	if (sourceActionsDisabled || info?.type !== 'prerendered') {
		return null;
	}

	return (
		<InspectorQuickAction
			disabled={busy || nodePathInfo.numberOfSequencesWithThisNodePath !== 1}
			onClick={onRestore}
			aria-label={
				info.stale
					? `${info.compositionId} was edited after it was rendered`
					: `Rendered from ${info.compositionId}`
			}
			renderIcon={(color) => <UndoIcon color={color} style={iconStyle} />}
		>
			{info.stale ? 'Restore unrendered (out of date)' : 'Restore unrendered'}
		</InspectorQuickAction>
	);
};
