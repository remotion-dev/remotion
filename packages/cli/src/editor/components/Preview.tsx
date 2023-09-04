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
import {RemTextarea} from './NewComposition/RemTextarea';

type AssetResolution = {
	width: number;
	height: number;
};

const jsonStyle: React.CSSProperties = {
	marginTop: 14,
	marginBottom: 14,
	fontFamily: 'monospace',
	flex: 1,
};

const msgStyle: React.CSSProperties = {
	fontSize: 13,
	color: 'white',
	fontFamily: 'sans-serif',
	display: 'flex',
	justifyContent: 'center',
};

type AssetFileType = 'audio' | 'video' | 'image' | 'json' | 'other';
const getFileType = (fileName: string | null): AssetFileType => {
	if (!fileName) {
		return 'other';
	}

	const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
	const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'webm'];
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

	if (fileExtension === 'json') {
		return 'json';
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
	const [json, setJson] = useState<string | null>(null);
	if (!currentAsset) {
		return null;
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

	if (fileType === 'json') {
		fetch(staticFileSrc)
			.then((res) => res.json())
			.then((jsonRes) => {
				setJson(JSON.stringify(jsonRes, null, 2));
			});
		return (
			<RemTextarea
				value={json ?? undefined}
				status="ok"
				onChange={() => {
					return null;
				}}
				style={jsonStyle}
			/>
		);
	}

	return <div style={msgStyle}> Unsupported file type</div>;
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
	const [assetResolution, setAssetResolution] =
		useState<AssetResolution | null>(null);

	const currentAssetType = useMemo(() => {
		return getFileType(currentAsset);
	}, [currentAsset]);

	useEffect(() => {
		const fetchMetadata = async () => {
			if (!currentAsset) {
				return;
			}

			const assetSrc = staticFile(currentAsset);
			if (currentAssetType === 'video') {
				await getVideoMetadata(assetSrc).then((data) => {
					setAssetResolution({width: data.width, height: data.height});
				});
				return;
			}

			if (currentAssetType === 'image') {
				const img = new Image();
				img.onload = () => {
					setAssetResolution({width: img.width, height: img.height});
				};

				img.src = assetSrc;
				return;
			}

			setAssetResolution({width: 600, height: 600});
		};

		fetchMetadata();
	}, [currentAsset, currentAssetType]);

	const {centerX, centerY, yCorrection, xCorrection, scale} = useMemo(() => {
		if (assetResolution && mediaType === 'asset') {
			return PlayerInternals.calculateCanvasTransformation({
				canvasSize,
				compositionHeight: assetResolution.height,
				compositionWidth: assetResolution.width,
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
		assetResolution,
		canvasSize,
		config.height,
		config.width,
		mediaType,
		previewSize.size,
	]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width:
				assetResolution && mediaType === 'asset'
					? assetResolution.width * scale
					: config.width * scale,
			height:
				assetResolution && mediaType === 'asset'
					? assetResolution.height * scale
					: config.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX - previewSize.translation.x,
			top: centerY - previewSize.translation.y,
			overflow: 'hidden',
			justifyContent:
				currentAssetType === 'audio'
					? 'flex-end'
					: mediaType === 'asset'
					? 'center'
					: 'flex-start',
			alignItems: currentAssetType === 'audio' ? 'center' : 'normal',
		};
	}, [
		assetResolution,
		centerX,
		centerY,
		config.height,
		config.width,
		currentAssetType,
		mediaType,
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
