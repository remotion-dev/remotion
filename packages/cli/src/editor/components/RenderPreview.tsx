import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
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
}> = ({path}) => {
	const fileType = getPreviewFileType(path);
	const src = window.remotion_staticBase.replace('static', 'outputs') + path;
	const connectionStatus = useContext(StudioServerConnectionCtx).type;

	if (connectionStatus === 'disconnected') {
		return <div style={errMsgStyle}>Studio server disconnected</div>;
	}

	return (
		<FilePreview
			currentAsset={path}
			fileSize={null}
			fileType={fileType}
			src={src}
		/>
	);
};
