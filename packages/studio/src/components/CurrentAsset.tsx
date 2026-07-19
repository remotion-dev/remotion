import {formatBytes} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals, staticFile} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {formatMediaDuration} from '../helpers/format-media-duration';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {
	renderHumanReadableAudioCodec,
	renderHumanReadableVideoCodec,
} from '../helpers/render-codec-label';
import type {MediaMetadata} from '../helpers/use-media-metadata';
import {useMediaMetadata} from '../helpers/use-media-metadata';
import {CaptionJsonInspector} from './CaptionJsonInspector';
import {InlineEditableTitle} from './InlineEditableTitle';
import {
	INSPECTOR_INFO_HEADER_MIN_HEIGHT,
	InspectorInfoHeader,
	InspectorInfoSubtitle,
} from './InspectorInfoHeader';
import {
	getStaticFileRenameSelection,
	useRenameStaticFile,
} from './NewComposition/use-rename-static-file';
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

const formatFps = (fps: number) => `${fps.toFixed(2)} FPS`;

export const getCurrentAssetMediaDetailLines = (
	mediaMetadata: MediaMetadata,
) => {
	const detailLines: string[] = [];

	if (mediaMetadata.hasVideoTrack === true) {
		const videoParts = [
			renderHumanReadableVideoCodec(mediaMetadata.videoCodec),
		];

		if (mediaMetadata.fps !== null) {
			videoParts.push(formatFps(mediaMetadata.fps));
		}

		if (mediaMetadata.isHdr !== null) {
			videoParts.push(`HDR: ${mediaMetadata.isHdr ? 'Yes' : 'No'}`);
		}

		detailLines.push(`Video: ${videoParts.join(' · ')}`);
	}

	if (mediaMetadata.hasAudioTrack === true) {
		const audioParts = [
			renderHumanReadableAudioCodec(mediaMetadata.audioCodec),
		];

		if (mediaMetadata.sampleRate !== null) {
			audioParts.push(`${mediaMetadata.sampleRate} Hz`);
		}

		detailLines.push(`Audio: ${audioParts.join(' · ')}`);
	} else if (mediaMetadata.hasAudioTrack === false) {
		detailLines.push('Audio: No audio');
	}

	return detailLines;
};

export const AssetInfo: React.FC<{
	readonly assetName: string | null;
	readonly contentSized?: boolean;
	readonly onAssetClick?: () => void;
	readonly readOnlyStudio: boolean;
}> = ({assetName, contentSized = false, onAssetClick, readOnlyStudio}) => {
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const staticFiles = useStaticFiles();
	const renameFile = useRenameStaticFile({
		relativePath: assetName ?? '',
		staticFiles,
	});

	const sizeInBytes = useMemo(() => {
		if (!assetName) {
			return null;
		}

		const file = staticFiles.find((f) => f.name === assetName);
		return file?.sizeInBytes ?? null;
	}, [assetName, staticFiles]);

	const src = getCurrentAssetMetadataSource(assetName);
	const mediaMetadata = useMediaMetadata(src);
	const canRename =
		onAssetClick === undefined &&
		connectionStatus === 'connected' &&
		!readOnlyStudio;
	const onRename = useCallback(
		(newName: string) => {
			renameFile(newName).catch(() => undefined);
		},
		[renameFile],
	);

	if (!assetName) {
		return <InspectorInfoHeader contentSized={contentSized} />;
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

	const mediaDetailLines = mediaMetadata
		? getCurrentAssetMediaDetailLines(mediaMetadata)
		: [];

	return (
		<InspectorInfoHeader contentSized={contentSized}>
			<InlineEditableTitle
				value={fileName}
				canRename={canRename}
				getInitialSelection={getStaticFileRenameSelection}
				onClick={onAssetClick}
				onCommit={onRename}
				title={assetName}
			/>
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
			{mediaDetailLines.map((line) => {
				return <InspectorInfoSubtitle key={line}>{line}</InspectorInfoSubtitle>;
			})}
		</InspectorInfoHeader>
	);
};

export const CurrentAsset: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const staticFiles = useStaticFiles();
	const assetName =
		canvasContent?.type === 'asset' ? canvasContent.asset : null;
	const staticFileEntry = staticFiles.find((file) => file.name === assetName);
	const isJson = assetName !== null && getPreviewFileType(assetName) === 'json';

	return (
		<>
			<AssetInfo assetName={assetName} readOnlyStudio={readOnlyStudio} />
			{isJson && staticFileEntry ? (
				<CaptionJsonInspector
					src={`${staticFileEntry.src}?date=${staticFileEntry.lastModified}`}
					editableFilePath={
						readOnlyStudio ? undefined : (assetName ?? undefined)
					}
				/>
			) : null}
		</>
	);
};
