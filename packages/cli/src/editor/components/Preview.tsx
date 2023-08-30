import type {VideoMetadata} from '@remotion/media-utils';
import {getVideoMetadata} from '@remotion/media-utils';
import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Internals, staticFile, useVideoConfig} from 'remotion';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {CheckerboardContext} from '../state/checkerboard';
import {PreviewSizeContext} from '../state/preview-size';

const getFileType = (fileName: string | null) => {
	if (!fileName) {
		return 'other';
	}

	const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
	const videoExtensions = ['mp4', 'avi', 'mkv', 'mov'];
	const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

	const fileExtension = fileName.split('.').pop()?.toLowerCase();
	if (fileExtension === undefined) {
		throw new Error('File extension is undefined');
	}

	if (audioExtensions.includes(fileExtension)) {
		return 'audio';
	}

	if (videoExtensions.includes(fileExtension)) {
		return 'video';
	}

	if (imageExtensions.includes(fileExtension)) {
		return 'image';
	}

	return 'other';
};

const checkerboardSize = 49;

const containerStyle = (options: {
	scale: number;
	xCorrection: number;
	yCorrection: number;
	width: number;
	height: number;
	checkerboard: boolean;
}): React.CSSProperties => {
	return {
		transform: `scale(${options.scale})`,
		marginLeft: options.xCorrection,
		marginTop: options.yCorrection,
		width: options.width,
		height: options.height,
		display: 'flex',
		position: 'absolute',
		backgroundColor: checkerboardBackgroundColor(options.checkerboard),
		backgroundImage: checkerboardBackgroundImage(options.checkerboard),
		backgroundSize:
			getCheckerboardBackgroundSize(checkerboardSize) /* Must be a square */,
		backgroundPosition:
			getCheckerboardBackgroundPos(
				checkerboardSize,
			) /* Must be half of one side of the square */,
	};
};

const AssetComponent: React.FC<{currentAsset: string | null}> = ({
	currentAsset,
}) => {
	const fileType = getFileType(currentAsset);

	if (!currentAsset) {
		return <div />;
	}

	const staticFileSrc = staticFile(currentAsset);

	if (fileType === 'audio') {
		return (
			<div>
				<audio src={staticFileSrc} controls />
			</div>
		);
	}

	if (fileType === 'video') {
		return <video src={staticFileSrc} controls />;
	}

	if (fileType === 'image') {
		return <img src={staticFileSrc} />;
	}

	return <div> No file found</div>;
};

const Inner: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const {size: previewSize} = useContext(PreviewSizeContext);
	const {currentAsset} = useContext(Internals.CompositionManager);
	const portalContainer = useRef<HTMLDivElement>(null);
	const {mediaType} = useContext(Internals.CompositionManager);
	const config = useVideoConfig();
	const {checkerboard} = useContext(CheckerboardContext);
	const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
	console.log('mediatype: ', mediaType, 'metadata: ', metadata);
	useEffect(() => {
		const fetchMetadata = async () => {
			const fileType = getFileType(currentAsset);
			if (fileType !== 'video' || !currentAsset) {
				return;
			}

			const assetSrc = staticFile(currentAsset);
			await getVideoMetadata(assetSrc).then((data) => {
				setMetadata(data);
			});
		};

		fetchMetadata();
	}, [currentAsset]);

	const {centerX, centerY, yCorrection, xCorrection, scale} = useMemo(() => {
		if (metadata && mediaType === 'asset') {
			return PlayerInternals.calculateCanvasTransformation({
				canvasSize,
				compositionHeight: metadata.height,
				compositionWidth: metadata.width,
				previewSize: previewSize.size,
			});
		}

		return PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: previewSize.size,
		});
	}, [
		canvasSize,
		config.height,
		config.width,
		mediaType,
		metadata,
		previewSize.size,
	]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width:
				metadata && mediaType === 'asset'
					? metadata.width * scale
					: config.width * scale,
			height:
				metadata && mediaType === 'asset'
					? metadata.height * scale
					: config.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX - previewSize.translation.x,
			top: centerY - previewSize.translation.y,
			overflow: 'hidden',
		};
	}, [
		centerX,
		centerY,
		config.height,
		config.width,
		mediaType,
		metadata,
		previewSize.translation.x,
		previewSize.translation.y,
		scale,
	]);

	const style = useMemo((): React.CSSProperties => {
		return containerStyle({
			checkerboard,
			scale,
			xCorrection,
			yCorrection,
			width: config.width,
			height: config.height,
		});
	}, [
		checkerboard,
		config.height,
		config.width,
		scale,
		xCorrection,
		yCorrection,
	]);

	useEffect(() => {
		const {current} = portalContainer;
		current?.appendChild(Internals.portalNode());
		return () => {
			current?.removeChild(Internals.portalNode());
		};
	}, []);

	return (
		<div style={outer}>
			{mediaType === 'asset' ? (
				<AssetComponent currentAsset={currentAsset} />
			) : (
				<div ref={portalContainer} style={style} />
			)}
		</div>
	);
};

export const VideoPreview: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const config = Internals.useUnsafeVideoConfig();

	if (!config) {
		return null;
	}

	return <Inner canvasSize={canvasSize} />;
};
