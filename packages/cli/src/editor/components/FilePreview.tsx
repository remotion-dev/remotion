import React from 'react';
import {JSONViewer} from './JSONViewer';
import {Spacing} from './layout';
import type {AssetFileType} from './Preview';
import {TextViewer} from './TextViewer';

const msgStyle: React.CSSProperties = {
	fontSize: 13,
	color: 'white',
	fontFamily: 'sans-serif',
	display: 'flex',
	justifyContent: 'center',
};

export const FilePreview: React.FC<{
	src: string;
	fileType: AssetFileType;
	currentAsset: string;
	fileSize: string | null;
}> = ({fileType, src, currentAsset, fileSize}) => {
	if (fileType === 'audio') {
		return (
			<div>
				<audio src={src} controls />
			</div>
		);
	}

	if (fileType === 'video') {
		return <video src={src} controls />;
	}

	if (fileType === 'image') {
		return <img src={src} />;
	}

	if (fileType === 'json') {
		return <JSONViewer src={src} />;
	}

	if (fileType === 'txt') {
		return <TextViewer src={src} />;
	}

	return (
		<>
			<div style={msgStyle}>{currentAsset}</div>
			{fileSize ? (
				<>
					<Spacing y={1} />
					<div style={msgStyle}>Size: {fileSize} </div>
				</>
			) : null}
		</>
	);
};
