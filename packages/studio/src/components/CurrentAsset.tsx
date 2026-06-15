import {formatBytes} from '@remotion/studio-shared';
import React, {useContext, useMemo} from 'react';
import {Internals, staticFile} from 'remotion';
import {formatMediaDuration} from '../helpers/format-media-duration';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {useMediaMetadata} from '../helpers/use-media-metadata';
import {
	INSPECTOR_INFO_HEADER_MIN_HEIGHT,
	InspectorInfoHeader,
	InspectorInfoSubtitle,
	InspectorInfoTitle,
} from './InspectorInfoHeader';
import {useStaticFiles} from './use-static-files';

export const CURRENT_ASSET_HEIGHT = INSPECTOR_INFO_HEADER_MIN_HEIGHT;

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
		return <InspectorInfoHeader />;
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
		<InspectorInfoHeader>
			<InspectorInfoTitle>{fileName}</InspectorInfoTitle>
			{subtitleParts.length > 0 ? (
				<InspectorInfoSubtitle>
					{subtitleParts.join(' · ')}
				</InspectorInfoSubtitle>
			) : null}
			{mediaMetadata ? (
				<InspectorInfoSubtitle>
					{formatMediaDuration(mediaMetadata.duration)}
				</InspectorInfoSubtitle>
			) : null}
		</InspectorInfoHeader>
	);
};
