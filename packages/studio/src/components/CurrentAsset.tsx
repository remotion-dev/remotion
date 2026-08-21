import {formatBytes} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals, staticFile} from 'remotion';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {CURRENT_COLOR} from '../helpers/colors';
import {formatMediaDuration} from '../helpers/format-media-duration';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {openInRemotionConvert} from '../helpers/open-in-remotion-convert';
import {
	renderHumanReadableAudioCodec,
	renderHumanReadableVideoCodec,
} from '../helpers/render-codec-label';
import {useImageMetadata} from '../helpers/use-image-metadata';
import type {MediaMetadata} from '../helpers/use-media-metadata';
import {useMediaMetadata} from '../helpers/use-media-metadata';
import {RemotionConvertIcon} from '../icons/remotion-convert';
import {InlineEditableTitle} from './InlineEditableTitle';
import {
	INSPECTOR_INFO_HEADER_MIN_HEIGHT,
	InspectorInfoHeader,
	InspectorInfoSubtitle,
} from './InspectorInfoHeader';
import {
	InspectorDetailRow,
	InspectorQuickActionsSection,
	InspectorQuickAction,
	InspectorSection,
} from './InspectorPanel/common';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from './InspectorPanelLayout';
import {
	getStaticFileRenameSelection,
	useRenameStaticFile,
} from './NewComposition/use-rename-static-file';
import {useStaticFiles} from './use-static-files';

export const CURRENT_ASSET_HEIGHT = INSPECTOR_INFO_HEADER_MIN_HEIGHT;

const convertIconStyle: React.CSSProperties = {
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

type CurrentAssetMediaDetail = {
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
	const video: CurrentAssetMediaDetail[] = [];
	const audio: CurrentAssetMediaDetail[] = [];

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
		audio: hasAudio ? audio : null,
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
		(getBrowserStudioOperations() !== null ||
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
	} else if (imageMetadata) {
		subtitleParts.push(imageMetadata.format);
		subtitleParts.push(`${imageMetadata.width}x${imageMetadata.height}`);
	}

	const mediaSections = mediaMetadata
		? getCurrentAssetMediaSections(mediaMetadata)
		: null;

	return (
		<>
			<InspectorInfoHeader
				contentSized={contentSized}
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
				{subtitleParts.length > 0 ? (
					<InspectorInfoSubtitle size={contentSized ? 'default' : 'inspector'}>
						{subtitleParts.join(' · ')}
					</InspectorInfoSubtitle>
				) : null}
			</InspectorInfoHeader>
			{mediaSections && mediaSections.video ? (
				<InspectorSection header="Video">
					<div style={assetMetadataStyle}>
						{mediaSections.video.map((detail) => (
							<InspectorDetailRow key={detail.label} label={detail.label}>
								{detail.value}
							</InspectorDetailRow>
						))}
					</div>
				</InspectorSection>
			) : null}
			{mediaSections && mediaSections.audio ? (
				<InspectorSection header="Audio">
					<div style={assetMetadataStyle}>
						{mediaSections.audio.map((detail) => (
							<InspectorDetailRow key={detail.label} label={detail.label}>
								{detail.value}
							</InspectorDetailRow>
						))}
					</div>
				</InspectorSection>
			) : null}
			{src ? (
				<InspectorQuickActionsSection>
					<InspectorQuickAction
						disabled={false}
						onClick={onOpenConvert}
						renderIcon={(color) => (
							<RemotionConvertIcon color={color} style={convertIconStyle} />
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
				</InspectorQuickActionsSection>
			) : null}
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
