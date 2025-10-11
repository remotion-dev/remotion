import React, {useContext} from 'react';
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
}> = ({path, assetMetadata}) => {
	const fileType = getPreviewFileType(path);
	const src = remotion_outputsBase + path;
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	if (connectionStatus === 'disconnected') {
		return <div style={errMsgStyle}>Studio server disconnected</div>;
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
