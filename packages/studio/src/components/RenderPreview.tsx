import React, {useContext, useEffect, useState} from 'react';
import type {ClientRenderOutput} from 'remotion';
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
	readonly clientRender?: ClientRenderOutput;
}> = ({path, assetMetadata, clientRender}) => {
	const fileType = getPreviewFileType(path);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const [blobUrl, setBlobUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!clientRender) {
			setBlobUrl(null);
			return;
		}

		let cancelled = false;
		let blobUrlToRevoke: string | null = null;

		clientRender.getBlob().then((blob) => {
			if (cancelled) return;
			blobUrlToRevoke = URL.createObjectURL(blob);
			setBlobUrl(blobUrlToRevoke);
		});

		return () => {
			cancelled = true;
			if (blobUrlToRevoke) {
				URL.revokeObjectURL(blobUrlToRevoke);
			}
		};
	}, [clientRender]);

	const src = blobUrl ?? remotion_outputsBase + path;

	if (connectionStatus === 'disconnected') {
		return <div style={errMsgStyle}>Studio server disconnected</div>;
	}

	if (clientRender && !blobUrl) {
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
