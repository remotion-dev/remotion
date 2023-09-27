import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {CanvasContent} from 'remotion';
import {getStaticFiles, Internals, staticFile} from 'remotion';
import {formatBytes} from '../../format-bytes';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {FAIL_COLOR} from '../helpers/colors';
import type {Dimensions} from '../helpers/is-current-selected-still';
import {CheckerboardContext} from '../state/checkerboard';
import {PreviewSizeContext} from '../state/preview-size';
import {JSONViewer} from './JSONViewer';
import {Spacing} from './layout';
import {Spinner} from './Spinner';

const spinnerContainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
};

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
	const [fileSize, setFileSize] = useState<string>('');
	const fileType = getPreviewFileType(currentAsset);
	const staticFileSrc = staticFile(currentAsset);
	const staticFiles = getStaticFiles();
	const [fileError, setFileError] = useState<string | null>(null);

	const exists = staticFiles.find((file) => file.name === currentAsset);
	useEffect(() => {
		if (exists) {
			fetch(staticFileSrc).then((res) => {
				if (!res.ok) {
					throw new Error('An error occured when fetching the staticSrc');
				}

				if (!res.body) {
					return;
				}

				const reader = res.body.getReader();
				let totalBytes = 0;

				const readChunk: any = () => {
					return reader.read().then(({done, value}) => {
						if (done) {
							setFileSize(formatBytes(totalBytes));
							return;
						}

						totalBytes += value.length;
						return readChunk();
					});
				};

				return readChunk();
			});
		} else {
			setFileError(`${currentAsset} doesn't exist in your public folder`);
		}
	}, [currentAsset, exists, staticFileSrc]);

	if (!currentAsset) {
		return null;
	}

	if (fileError) {
		return <div style={{...msgStyle, color: FAIL_COLOR}}>{fileError}</div>;
	}

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

	return (
		<>
			<div style={msgStyle}>{currentAsset}</div>
			<Spacing y={1} />
			<div style={msgStyle}>Size: {fileSize} </div>
		</>
	);
};

export const VideoPreview: React.FC<{
	canvasSize: Size;
	contentDimensions: Dimensions | 'none' | null;
	canvasContent: CanvasContent;
}> = ({canvasSize, contentDimensions, canvasContent}) => {
	if (!contentDimensions) {
		return (
			<div style={spinnerContainer}>
				<Spinner duration={0.5} size={24} />
			</div>
		);
	}

	return (
		<CompWhenItHasDimensions
			contentDimensions={contentDimensions}
			canvasSize={canvasSize}
			canvasContent={canvasContent}
		/>
	);
};

const CompWhenItHasDimensions: React.FC<{
	contentDimensions: Dimensions | 'none';
	canvasSize: Size;
	canvasContent: CanvasContent;
}> = ({contentDimensions, canvasSize, canvasContent}) => {
	const {size: previewSize} = useContext(PreviewSizeContext);

	const {centerX, centerY, yCorrection, xCorrection, scale} = useMemo(() => {
		if (contentDimensions === 'none') {
			return {
				centerX: 0,
				centerY: 0,
				yCorrection: 0,
				xCorrection: 0,
				scale: 1,
			};
		}

		return PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight: contentDimensions.height,
			compositionWidth: contentDimensions.width,
			previewSize: previewSize.size,
		});
	}, [canvasSize, contentDimensions, previewSize.size]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width:
				contentDimensions === 'none' ? '100%' : contentDimensions.width * scale,
			height:
				contentDimensions === 'none'
					? '100%'
					: contentDimensions.height * scale,
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
		contentDimensions,
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
					contentDimensions={contentDimensions as Dimensions}
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
