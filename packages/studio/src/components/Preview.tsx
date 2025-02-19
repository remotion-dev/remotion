import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals} from 'remotion';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {LIGHT_TEXT} from '../helpers/colors';
import type {AssetMetadata} from '../helpers/get-asset-metadata';
import type {Dimensions} from '../helpers/is-current-selected-still';
import {CheckerboardContext} from '../state/checkerboard';
import {RenderPreview} from './RenderPreview';
import {Spinner} from './Spinner';
import {StaticFilePreview} from './StaticFilePreview';

const centeredContainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
};

const label: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 14,
	color: LIGHT_TEXT,
};

export type AssetFileType =
	| 'audio'
	| 'video'
	| 'image'
	| 'json'
	| 'txt'
	| 'other';
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

	if (fileExtension === 'txt') {
		return 'txt';
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

export const VideoPreview: React.FC<{
	readonly canvasSize: Size;
	readonly contentDimensions: Dimensions | 'none' | null;
	readonly canvasContent: CanvasContent;
	readonly assetMetadata: AssetMetadata | null;
	readonly isRefreshing: boolean;
}> = ({
	canvasSize,
	contentDimensions,
	canvasContent,
	assetMetadata,
	isRefreshing,
}) => {
	if (assetMetadata && assetMetadata.type === 'not-found') {
		return (
			<div style={centeredContainer}>
				<div style={label}>File does not exist</div>
			</div>
		);
	}

	if (contentDimensions === null) {
		return (
			<div style={centeredContainer}>
				<Spinner duration={0.5} size={24} />
			</div>
		);
	}

	return (
		<CompWhenItHasDimensions
			contentDimensions={contentDimensions}
			canvasSize={canvasSize}
			canvasContent={canvasContent}
			assetMetadata={assetMetadata}
			isRefreshing={isRefreshing}
		/>
	);
};

const CompWhenItHasDimensions: React.FC<{
	readonly contentDimensions: Dimensions | 'none';
	readonly canvasSize: Size;
	readonly canvasContent: CanvasContent;
	readonly assetMetadata: AssetMetadata | null;
	readonly isRefreshing: boolean;
}> = ({
	contentDimensions,
	canvasSize,
	canvasContent,
	assetMetadata,
	isRefreshing,
}) => {
	const {size: previewSize} = useContext(Internals.PreviewSizeContext);

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
			opacity: isRefreshing ? 0.5 : 1,
		};
	}, [
		contentDimensions,
		scale,
		centerX,
		previewSize.translation.x,
		previewSize.translation.y,
		centerY,
		canvasContent,
		isRefreshing,
	]);

	return (
		<div style={outer}>
			{canvasContent.type === 'asset' ? (
				<StaticFilePreview
					assetMetadata={assetMetadata}
					currentAsset={canvasContent.asset}
				/>
			) : canvasContent.type === 'output' ? (
				<RenderPreview
					path={canvasContent.path}
					assetMetadata={assetMetadata}
				/>
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
	readonly scale: number;
	readonly xCorrection: number;
	readonly yCorrection: number;
	readonly contentDimensions: Dimensions;
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
