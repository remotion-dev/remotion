import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../../../../studio/src/helpers/client-id';
import {LIGHT_TEXT} from '../../../../studio/src/helpers/colors';
import type {AssetMetadata} from '../../../../studio/src/helpers/get-asset-metadata';
import {remotion_outputsBase} from '../../../../studio/src/helpers/get-asset-metadata';
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
	path: string;
	assetMetadata: AssetMetadata | null;
}> = ({path, assetMetadata}) => {
	const fileType = getPreviewFileType(path);
	const src = remotion_outputsBase + path;
	const connectionStatus = useContext(StudioServerConnectionCtx).type;

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
