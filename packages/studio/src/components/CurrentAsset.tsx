import {formatBytes} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals, staticFile} from 'remotion';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {CURRENT_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {formatMediaDuration} from '../helpers/format-media-duration';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {openInRemotionConvert} from '../helpers/open-in-remotion-convert';
import {
	renderHumanReadableAudioCodec,
	renderHumanReadableVideoCodec,
} from '../helpers/render-codec-label';
import {useImageMetadata} from '../helpers/use-image-metadata';
import type {MediaMetadata} from '../helpers/use-media-metadata';
import {useMediaMetadata} from '../helpers/use-media-metadata';
import {ExpandedFolderIcon} from '../icons/folder';
import {RemotionConvertIcon} from '../icons/remotion-convert';
import {TrashIcon} from '../icons/trash';
import {InlineEditableTitle} from './InlineEditableTitle';
import {InspectorInfoHeader} from './InspectorInfoHeader';
import {
	InspectorDetailRow,
	InspectorQuickActionsSection,
	InspectorQuickAction,
	InspectorSection,
} from './InspectorPanel/common';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from './InspectorPanelLayout';
import {COMPACT_CONTROL_ROW_HEIGHT} from './layout';
import {
	getStaticFileRenameSelection,
	useRenameStaticFile,
} from './NewComposition/use-rename-static-file';
import {showNotification} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';
import {useDeleteAsset} from './use-delete-asset';
import {useStaticFiles} from './use-static-files';

export const CURRENT_ASSET_HEIGHT = COMPACT_CONTROL_ROW_HEIGHT;

const quickActionIconStyle: React.CSSProperties = {
	display: 'block',
	height: 18,
	width: 18,
};

const convertArrowStyle: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	marginLeft: 4,
	verticalAlign: -2,
	width: 12,
};

const assetMetadataStyle: React.CSSProperties = {
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

const assetMetadataValueStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '20px',
};

const assetEmptyStateStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: 1.4,
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
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

export const getCurrentAssetImageMetadataSource = (
	assetName: string | null,
) => {
	if (!assetName) {
		return null;
	}

	return getPreviewFileType(assetName) === 'image'
		? staticFile(assetName)
		: null;
};

const formatFps = (fps: number) => `${fps.toFixed(2)} FPS`;

type CurrentAssetDetail = {
	readonly label: string;
	readonly value: string;
};

export const getCurrentAssetMediaSections = (mediaMetadata: MediaMetadata) => {
	const hasVideo =
		mediaMetadata.hasVideoTrack === true ||
		mediaMetadata.width !== null ||
		mediaMetadata.height !== null ||
		mediaMetadata.videoCodec !== null ||
		mediaMetadata.fps !== null ||
		mediaMetadata.isHdr !== null;
	const hasAudio =
		mediaMetadata.hasAudioTrack === true ||
		mediaMetadata.audioCodec !== null ||
		mediaMetadata.sampleRate !== null;
	const video: CurrentAssetDetail[] = [];
	const audio: CurrentAssetDetail[] = [];

	if (hasVideo) {
		if (mediaMetadata.width !== null && mediaMetadata.height !== null) {
			video.push({
				label: 'Dimensions',
				value: `${mediaMetadata.width} × ${mediaMetadata.height}`,
			});
		}

		if (mediaMetadata.fps !== null) {
			video.push({label: 'Frame rate', value: formatFps(mediaMetadata.fps)});
		}

		video.push({
			label: 'Duration',
			value: formatMediaDuration(mediaMetadata.duration),
		});
		video.push({
			label: 'Codec',
			value: renderHumanReadableVideoCodec(mediaMetadata.videoCodec),
		});

		if (mediaMetadata.isHdr !== null) {
			video.push({
				label: 'HDR',
				value: mediaMetadata.isHdr ? 'Yes' : 'No',
			});
		}
	}

	if (hasAudio) {
		audio.push({
			label: 'Duration',
			value: formatMediaDuration(mediaMetadata.duration),
		});
		audio.push({
			label: 'Codec',
			value: renderHumanReadableAudioCodec(mediaMetadata.audioCodec),
		});

		if (mediaMetadata.sampleRate !== null) {
			audio.push({
				label: 'Sample rate',
				value: `${mediaMetadata.sampleRate} Hz`,
			});
		}
	}

	return {
		audio:
			hasAudio || (hasVideo && mediaMetadata.hasAudioTrack === false)
				? audio
				: null,
		video: hasVideo ? video : null,
	};
};

export const AssetInfo: React.FC<{
	readonly assetName: string | null;
	readonly contentSized?: boolean;
	readonly onAssetClick?: () => void;
	readonly readOnlyStudio: boolean;
}> = ({assetName, contentSized = false, onAssetClick, readOnlyStudio}) => {
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const browserStudioOperations = getBrowserStudioOperations();

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
	const imageSrc = getCurrentAssetImageMetadataSource(assetName);
	const imageMetadata = useImageMetadata(imageSrc);
	const canRename =
		onAssetClick === undefined &&
		(browserStudioOperations !== null ||
			(connectionStatus === 'connected' && !readOnlyStudio));
	const onRename = useCallback(
		(newName: string) => {
			renameFile(newName).catch(() => undefined);
		},
		[renameFile],
	);
	const onOpenConvert = useCallback(() => {
		if (assetName === null) {
			return;
		}

		openInRemotionConvert({relativePath: assetName});
	}, [assetName]);
	const onShowInFileManager = useCallback(() => {
		if (assetName === null || !window.remotion_publicFolderExists) {
			showNotification('Could not find the public folder', 2000);
			return;
		}

		openInFileExplorer({
			directory: window.remotion_publicFolderExists + '/' + assetName,
		}).catch((err) => {
			showNotification(`Could not open file: ${err.message}`, 2000);
		});
	}, [assetName]);
	const onDelete = useDeleteAsset(assetName);

	if (!assetName) {
		return (
			<InspectorInfoHeader
				contentSized={contentSized}
				minHeight={CURRENT_ASSET_HEIGHT}
			/>
		);
	}

	const fileName = assetName.split('/').pop() ?? assetName;
	const fileDetails: CurrentAssetDetail[] = [];
	if (imageMetadata !== null) {
		fileDetails.push({
			label: 'Dimensions',
			value: `${imageMetadata.width} × ${imageMetadata.height}`,
		});
	}

	const container = mediaMetadata?.format ?? imageMetadata?.format ?? null;
	if (container !== null) {
		fileDetails.push({label: 'Container', value: container});
	}

	if (sizeInBytes !== null) {
		fileDetails.push({label: 'Size', value: formatBytes(sizeInBytes)});
	}

	const mediaSections = mediaMetadata
		? getCurrentAssetMediaSections(mediaMetadata)
		: null;
	const fileManagerAvailable = browserStudioOperations === null;
	const fileManagerDisabled =
		window.remotion_publicFolderExists === null ||
		readOnlyStudio ||
		connectionStatus !== 'connected';
	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);
	const mutationsDisabled =
		browserStudioOperations === null &&
		(readOnlyStudio || connectionStatus !== 'connected');

	return (
		<>
			<InspectorInfoHeader
				contentSized={contentSized}
				minHeight={CURRENT_ASSET_HEIGHT}
				padding={
					contentSized
						? `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px 6px`
						: '4px 0'
				}
			>
				<InlineEditableTitle
					value={fileName}
					canRename={canRename}
					getInitialSelection={getStaticFileRenameSelection}
					onClick={onAssetClick}
					onCommit={onRename}
					size={contentSized ? 'default' : 'inspector'}
					title={assetName}
				/>
			</InspectorInfoHeader>
			{fileDetails.length > 0 ? (
				<InspectorSection header="File">
					<div style={assetMetadataStyle}>
						{fileDetails.map((detail) => (
							<InspectorDetailRow key={detail.label} label={detail.label}>
								<span style={assetMetadataValueStyle}>{detail.value}</span>
							</InspectorDetailRow>
						))}
					</div>
				</InspectorSection>
			) : null}
			{mediaSections && mediaSections.video ? (
				<InspectorSection header="Video">
					<div style={assetMetadataStyle}>
						{mediaSections.video.map((detail) => (
							<InspectorDetailRow key={detail.label} label={detail.label}>
								<span style={assetMetadataValueStyle}>{detail.value}</span>
							</InspectorDetailRow>
						))}
					</div>
				</InspectorSection>
			) : null}
			{mediaSections && mediaSections.audio !== null ? (
				<InspectorSection header="Audio">
					{mediaSections.audio.length === 0 ? (
						<div style={assetEmptyStateStyle}>None</div>
					) : (
						<div style={assetMetadataStyle}>
							{mediaSections.audio.map((detail) => (
								<InspectorDetailRow key={detail.label} label={detail.label}>
									<span style={assetMetadataValueStyle}>{detail.value}</span>
								</InspectorDetailRow>
							))}
						</div>
					)}
				</InspectorSection>
			) : null}
			<InspectorQuickActionsSection>
				{src ? (
					<InspectorQuickAction
						disabled={false}
						onClick={onOpenConvert}
						renderIcon={(color) => (
							<RemotionConvertIcon color={color} style={quickActionIconStyle} />
						)}
					>
						Convert
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							style={convertArrowStyle}
						>
							<path
								d="M4 12 12 4M6 4h6v6"
								fill="none"
								stroke={CURRENT_COLOR}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1.5"
							/>
						</svg>
					</InspectorQuickAction>
				) : null}
				{fileManagerAvailable ? (
					<InspectorQuickAction
						disabled={fileManagerDisabled}
						onClick={onShowInFileManager}
						renderIcon={(color) => (
							<ExpandedFolderIcon color={color} style={quickActionIconStyle} />
						)}
					>
						Show in {fileManagerName}
					</InspectorQuickAction>
				) : null}
				<InspectorQuickAction
					disabled={mutationsDisabled}
					onClick={onDelete}
					renderIcon={(color) => (
						<TrashIcon color={color} style={quickActionIconStyle} />
					)}
				>
					Delete
				</InspectorQuickAction>
			</InspectorQuickActionsSection>
		</>
	);
};

export const CurrentAsset: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const assetName =
		canvasContent?.type === 'asset' ? canvasContent.asset : null;

	return <AssetInfo assetName={assetName} readOnlyStudio={readOnlyStudio} />;
};
