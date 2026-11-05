import React, {useContext, useEffect, useMemo, useState} from 'react';
import {addAssetCacheBust} from '../helpers/add-asset-cache-bust';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {getRenderOutputSrc} from '../helpers/get-asset-metadata';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import type {RenderOutputPlaybackContent} from '../helpers/render-output-playback';
import {
	getRenderOutputVideoClock,
	getMediaPreviewClock,
} from '../helpers/use-media-metadata';
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
	const [resolvedClock, setResolvedClock] = useState<{
		src: string;
		clock: ReturnType<typeof getMediaPreviewClock>;
	} | null>(null);

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
	const src = getBlob
		? blobUrl
		: assetMetadata?.type === 'found'
			? addAssetCacheBust({
					src: getRenderOutputSrc(path),
					fetchedAt: assetMetadata.fetchedAt,
				})
			: null;
	const metadata =
		assetMetadata?.type === 'found' ? assetMetadata.mediaMetadata : null;
	const needsVideoClock =
		fileType === 'video' &&
		(Boolean(getBlob) || metadata?.videoTiming?.durationInFrames === null);
	useEffect(() => {
		if (!needsVideoClock || src === null) return;
		const controller = new AbortController();
		getRenderOutputVideoClock(src, controller.signal)
			.then((videoClock) => {
				if (!controller.signal.aborted)
					setResolvedClock({src, clock: videoClock});
			})
			.catch(() => {
				if (!controller.signal.aborted)
					setResolvedClock({src, clock: getMediaPreviewClock(metadata)});
			});
		return () => controller.abort();
	}, [metadata, needsVideoClock, src]);

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

	const clock = needsVideoClock
		? resolvedClock?.src === src
			? resolvedClock.clock
			: null
		: getMediaPreviewClock(fileType === 'video' ? metadata : null);

	return (
		<FilePreview
			outputPlayback={{content: outputPlaybackContent, clock}}
			assetMetadata={assetMetadata}
			currentAsset={path}
			fileType={fileType}
			src={src}
		/>
	);
};
