import React, {useContext, useEffect, useState} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import {remotion_outputsBase} from '../helpers/get-asset-metadata';
import {FilePreview} from './FilePreview';
import {getPreviewFileType} from './Preview';

const msgStyle: React.CSSProperties = {
	fontSize: 13,
	color: 'white',
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
}> = ({path, assetMetadata, getBlob}) => {
	const fileType = getPreviewFileType(path);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [blobError, setBlobError] = useState<Error | null>(null);

	useEffect(() => {
		if (!getBlob) {
			setBlobUrl(null);
			setBlobError(null);
			return;
		}

		let cancelled = false;
		let blobUrlToRevoke: string | null = null;

		setBlobError(null);

		getBlob()
			.then((blob) => {
				const url = URL.createObjectURL(blob);
				if (cancelled) {
					URL.revokeObjectURL(url);
					return;
				}

				blobUrlToRevoke = url;
				setBlobUrl(url);
			})
			.catch((err) => {
				if (cancelled) {
					return;
				}

				setBlobError(err instanceof Error ? err : new Error(String(err)));
			});

		return () => {
			cancelled = true;
			if (blobUrlToRevoke) {
				URL.revokeObjectURL(blobUrlToRevoke);
			}
		};
	}, [getBlob]);

	const src = blobUrl ?? remotion_outputsBase + path;

	if (connectionStatus === 'disconnected') {
		return <div style={errMsgStyle}>Studio server disconnected</div>;
	}

	if (getBlob && blobError) {
		return (
			<div style={errMsgStyle}>Failed to load preview: {blobError.message}</div>
		);
	}

	if (getBlob && !blobUrl) {
		return <div style={msgStyle}>Loading preview...</div>;
	}

	return (
		<FilePreview
			assetMetadata={assetMetadata}
			currentAsset={path}
			fileType={fileType}
			src={src}
		/>
	);
};
