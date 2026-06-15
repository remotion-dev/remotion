import {formatBytes} from '@remotion/studio-shared';
import React, {useContext, useMemo} from 'react';
import {Internals, staticFile} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {formatMediaDuration} from '../helpers/format-media-duration';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {useMediaMetadata} from '../helpers/use-media-metadata';
import {useStaticFiles} from './use-static-files';

export const CURRENT_ASSET_HEIGHT = 80;

const container: React.CSSProperties = {
	height: CURRENT_ASSET_HEIGHT,
	display: 'block',
	padding: 12,
	color: 'white',
	backgroundColor: BACKGROUND,
};

const title: React.CSSProperties = {
	fontWeight: 'bold',
	fontSize: 12,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

const subtitle: React.CSSProperties = {
	fontSize: 12,
	opacity: 0.8,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

export const getCurrentAssetMetadataSource = (assetName: string | null) => {
	if (!assetName) {
		return null;
	}

	const fileType = getPreviewFileType(assetName);
	return fileType === 'audio' || fileType === 'video'
		? staticFile(assetName)
		: null;
};

export const CurrentAsset: React.FC = () => {
	const {canvasContent} = useContext(Internals.CompositionManager);

	const assetName =
		canvasContent?.type === 'asset' ? canvasContent.asset : null;

	const staticFiles = useStaticFiles();

	const sizeInBytes = useMemo(() => {
		if (!assetName) {
			return null;
		}

		const file = staticFiles.find((f) => f.name === assetName);
		return file?.sizeInBytes ?? null;
	}, [assetName, staticFiles]);

	const src = getCurrentAssetMetadataSource(assetName);
	const mediaMetadata = useMediaMetadata(src);

	if (!assetName) {
		return <div style={container} />;
	}

	const fileName = assetName.split('/').pop() ?? assetName;

	const subtitleParts: string[] = [];
	if (sizeInBytes !== null) {
		subtitleParts.push(formatBytes(sizeInBytes));
	}

	if (mediaMetadata) {
		if (mediaMetadata.format) {
			subtitleParts.push(mediaMetadata.format);
		}

		if (mediaMetadata.width !== null && mediaMetadata.height !== null) {
			subtitleParts.push(`${mediaMetadata.width}x${mediaMetadata.height}`);
		}
	}

	return (
		<div style={container}>
			<div style={row}>
				<div>
					<div style={title}>{fileName}</div>
					{subtitleParts.length > 0 ? (
						<div style={subtitle}>{subtitleParts.join(' · ')}</div>
					) : null}
					{mediaMetadata ? (
						<div style={subtitle}>
							{formatMediaDuration(mediaMetadata.duration)}
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};
