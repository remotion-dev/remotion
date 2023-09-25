import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals, staticFile} from 'remotion';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import type {Dimensions} from '../helpers/is-current-selected-still';
import {CheckerboardContext} from '../state/checkerboard';
import {PreviewSizeContext} from '../state/preview-size';
import {JSONViewer} from './JSONViewer';

const msgStyle: React.CSSProperties = {
	fontSize: 13,
	color: 'white',
	fontFamily: 'sans-serif',
	display: 'flex',
	justifyContent: 'center',
};

type AssetFileType = 'audio' | 'video' | 'image' | 'json' | 'other';
export const getPreviewFileType = (fileName: string | null): AssetFileType => {
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

const AssetComponent: React.FC<{currentAsset: string}> = ({currentAsset}) => {
	const fileType = getPreviewFileType(currentAsset);

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
		return <JSONViewer src={staticFileSrc} />;
	}

	return <div style={msgStyle}> Unsupported file type</div>;
};

export const VideoPreview: React.FC<{
	canvasSize: Size;
	contentDimensions: Dimensions | null;
	canvasContent: CanvasContent;
}> = ({canvasSize, contentDimensions, canvasContent}) => {
	if (!contentDimensions) {
		return <div>loading...</div>;
	}

	return (
		<CompWhenItHasDimensions
			derivedConfig={contentDimensions}
			canvasSize={canvasSize}
			canvasContent={canvasContent}
		/>
	);
};

const CompWhenItHasDimensions: React.FC<{
	derivedConfig: Dimensions;
	canvasSize: Size;
	canvasContent: CanvasContent;
}> = ({derivedConfig: contentDimensions, canvasSize, canvasContent}) => {
	const {size: previewSize} = useContext(PreviewSizeContext);

	const {centerX, centerY, yCorrection, xCorrection, scale} = useMemo(() => {
		return PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight: contentDimensions.height,
			compositionWidth: contentDimensions.width,
			previewSize: previewSize.size,
		});
	}, [
		canvasSize,
		contentDimensions.height,
		contentDimensions.width,
		previewSize.size,
	]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width: contentDimensions.width * scale,
			height: contentDimensions.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX - previewSize.translation.x,
			top: centerY - previewSize.translation.y,
			overflow: 'hidden',
			justifyContent: canvasContent.type === 'asset' ? 'center' : 'flex-start',
			alignItems:
				canvasContent.type === 'asset' &&
				getPreviewFileType(canvasContent.asset) === 'audio'
					? 'center'
					: 'normal',
		};
	}, [
		contentDimensions.width,
		contentDimensions.height,
		scale,
		centerX,
		previewSize.translation.x,
		previewSize.translation.y,
		centerY,
		canvasContent,
	]);

	return (
		<div style={outer}>
			{canvasContent.type === 'asset' ? (
				<AssetComponent currentAsset={canvasContent.asset} />
			) : (
				<PortalContainer
					contentDimensions={contentDimensions}
					scale={scale}
					xCorrection={xCorrection}
					yCorrection={yCorrection}
				/>
			)}
		</div>
	);
};

const PortalContainer: React.FC<{
	scale: number;
	xCorrection: number;
	yCorrection: number;
	contentDimensions: Dimensions;
}> = ({scale, xCorrection, yCorrection, contentDimensions}) => {
	const {checkerboard} = useContext(CheckerboardContext);

	const style = useMemo((): React.CSSProperties => {
		return containerStyle({
			checkerboard,
			scale,
			xCorrection,
			yCorrection,
			width: contentDimensions.width,
			height: contentDimensions.height,
		});
	}, [
		checkerboard,
		contentDimensions.height,
		contentDimensions.width,
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

	const portalContainer = useRef<HTMLDivElement>(null);

	return <div ref={portalContainer} style={style} />;
};
