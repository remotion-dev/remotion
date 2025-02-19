import {useContext} from 'react';
import {staticFile} from 'remotion';
import {getStaticFiles} from '../api/get-static-files';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
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

export const StaticFilePreview: React.FC<{
	currentAsset: string;
	assetMetadata: AssetMetadata | null;
}> = ({currentAsset, assetMetadata}) => {
	const fileType = getPreviewFileType(currentAsset);
	const staticFileSrc = staticFile(currentAsset);
	const staticFiles = getStaticFiles();
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const exists = staticFiles.find((file) => file.name === currentAsset);

	if (connectionStatus === 'disconnected') {
		return <div style={errMsgStyle}>Studio server disconnected</div>;
	}

	if (!exists) {
		return (
			<div style={errMsgStyle}>
				{currentAsset} does not exist in your public folder.
			</div>
		);
	}

	if (!currentAsset) {
		return null;
	}

	return (
		<FilePreview
			currentAsset={currentAsset}
			fileType={fileType}
			src={`${staticFileSrc}?date=${assetMetadata && assetMetadata.type === 'found' ? assetMetadata.fetchedAt : 0}`}
			assetMetadata={assetMetadata}
		/>
	);
};
