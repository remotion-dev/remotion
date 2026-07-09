import {formatBytes} from '@remotion/studio-shared';
import React from 'react';
import {WHITE} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import type {AssetFileType} from '../helpers/get-preview-file-type';
import {JSONViewer} from './JSONViewer';
import {Spacing} from './layout';
import {TextViewer} from './TextViewer';

const msgStyle: React.CSSProperties = {
	fontSize: 13,
	color: WHITE,
	fontFamily: 'sans-serif',
	display: 'flex',
	justifyContent: 'center',
};

export const FilePreview: React.FC<{
	readonly src: string;
	readonly fileType: AssetFileType;
	readonly currentAsset: string;
	readonly assetMetadata: AssetMetadata | null;
}> = ({fileType, src, currentAsset, assetMetadata}) => {
	if (!assetMetadata) {
		throw new Error('expected to have assetMetadata');
	}

	if (assetMetadata.type === 'not-found') {
		throw new Error('expected to have assetMetadata, got "not-found"');
	}

	if (assetMetadata.type === 'metadata-error') {
		throw new Error('unexpected metadata-error in FilePreview');
	}

	if (fileType === 'audio') {
		return <audio src={src} controls />;
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
			<Spacing y={0.5} />
			<div style={msgStyle}>Size: {formatBytes(assetMetadata.size)} </div>
		</>
	);
};
