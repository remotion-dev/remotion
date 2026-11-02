import React, {useContext, useEffect, useMemo, useState} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {getRenderOutputSrc} from '../helpers/get-asset-metadata';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import type {RenderOutputPlaybackContent} from '../helpers/render-output-playback';
import {getMediaMetadata} from '../helpers/use-media-metadata';
import {FilePreview} from './FilePreview';

const msgStyle: React.CSSProperties = {
	fontSize: 13,
	color: WHITE,
	fontFamily: 'sans-serif',
	display: 'flex',
	justifyContent: 'center',
};

const errMsgStyle: React.CSSProperties = {
	...msgStyle,
	color: LIGHT_TEXT,
};

export const RenderPreview: React.FC<{
	readonly path: string;
	readonly assetMetadata: AssetMetadata | null;
	readonly getBlob?: () => Promise<Blob>;
	readonly outputPlaybackContent: RenderOutputPlaybackContent;
}> = ({path, assetMetadata, getBlob, outputPlaybackContent}) => {
	const fileType = getPreviewFileType(path);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const blobIdentity = useMemo(() => ({getBlob}), [getBlob]);
	const [blobSource, setBlobSource] = useState<{
		identity: typeof blobIdentity;
		url: string;
	} | null>(null);
	const [blobFailure, setBlobFailure] = useState<{
		identity: typeof blobIdentity;
		error: Error;
	} | null>(null);
	const [blobFps, setBlobFps] = useState<{src: string; fps: number} | null>(
		null,
	);

	useEffect(() => {
		if (!getBlob) {
			return;
		}

		let cancelled = false;
		let blobUrlToRevoke: string | null = null;

		getBlob()
			.then((blob) => {
				const url = URL.createObjectURL(blob);
				if (cancelled) {
					URL.revokeObjectURL(url);
					return;
				}

				blobUrlToRevoke = url;
				setBlobSource({identity: blobIdentity, url});
			})
			.catch((err) => {
				if (cancelled) {
					return;
				}

				setBlobFailure({
					identity: blobIdentity,
					error: err instanceof Error ? err : new Error(String(err)),
				});
			});

		return () => {
			cancelled = true;
			if (blobUrlToRevoke) {
				URL.revokeObjectURL(blobUrlToRevoke);
			}
		};
	}, [blobIdentity, getBlob]);

	const blobUrl =
		blobSource?.identity === blobIdentity ? (blobSource?.url ?? null) : null;
	const blobError =
		blobFailure?.identity === blobIdentity
			? (blobFailure?.error ?? null)
			: null;
	const src = getBlob ? blobUrl : getRenderOutputSrc(path);
	useEffect(() => {
		if (!getBlob || src === null || fileType !== 'video') return;
		let cancelled = false;
		getMediaMetadata(src)
			.then((metadata) => {
				if (cancelled) return;
				const fps = metadata?.fps;
				setBlobFps({
					src,
					fps:
						fps !== null && fps !== undefined && Number.isFinite(fps) && fps > 0
							? fps
							: 30,
				});
			})
			.catch(() => {
				if (!cancelled) setBlobFps({src, fps: 30});
			});
		return () => {
			cancelled = true;
		};
	}, [fileType, getBlob, src]);

	if (!getBlob && connectionStatus === 'disconnected') {
		return <div style={errMsgStyle}>Studio server disconnected</div>;
	}

	if (getBlob && blobError) {
		return (
			<div style={errMsgStyle}>Failed to load preview: {blobError.message}</div>
		);
	}

	if (src === null) {
		return <div style={msgStyle}>Loading preview...</div>;
	}

	let outputFps: number | null = 30;
	if (fileType === 'video') {
		const detectedFps =
			assetMetadata?.type === 'found' ? assetMetadata.mediaMetadata?.fps : null;
		if (getBlob) outputFps = blobFps?.src === src ? blobFps.fps : null;
		else if (
			detectedFps !== null &&
			detectedFps !== undefined &&
			Number.isFinite(detectedFps) &&
			detectedFps > 0
		)
			outputFps = detectedFps;
	}

	return (
		<FilePreview
			outputPlayback={{content: outputPlaybackContent, fps: outputFps}}
			assetMetadata={assetMetadata}
			currentAsset={path}
			fileType={fileType}
			src={src}
		/>
	);
};
