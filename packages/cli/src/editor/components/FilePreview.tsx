import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
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

const errMsgStyle: React.CSSProperties = {
	...msgStyle,
	color: LIGHT_TEXT,
};

export const FilePreview: React.FC<{
	staticFileSrc: string;
	fileType: AssetFileType;
	currentAsset: string;
	fileSize: string;
}> = ({fileType, staticFileSrc, currentAsset, fileSize}) => {
	if (fileType === 'audio') {
		try {
			return (
				<div>
					<audio src={staticFileSrc} controls />
				</div>
			);
		} catch (err) {
			return <div style={errMsgStyle}>The audio could not be loaded</div>;
		}
	}

	if (fileType === 'video') {
		try {
			return <video src={staticFileSrc} controls />;
		} catch (err) {
			return <div style={errMsgStyle}>The video could not be loaded</div>;
		}
	}

	if (fileType === 'image') {
		try {
			return <img src={staticFileSrc} />;
		} catch (err) {
			return <div style={errMsgStyle}>The image could not be loaded</div>;
		}
	}

	if (fileType === 'json') {
		return <JSONViewer src={staticFileSrc} />;
	}

	if (fileType === 'txt') {
		return <TextViewer src={staticFileSrc} />;
	}

	return (
		<>
			<div style={msgStyle}>{currentAsset}</div>
			<Spacing y={1} />
			<div style={msgStyle}>Size: {fileSize} </div>
		</>
	);
};
