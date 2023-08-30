import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {Internals, staticFile, useVideoConfig, Video} from 'remotion';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {CheckerboardContext} from '../state/checkerboard';
import {PreviewSizeContext} from '../state/preview-size';

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

const AssetComponent: React.FC<{style: React.CSSProperties}> = ({style}) => {
	console.log(style);
	const {currentAsset} = useContext(Internals.CompositionManager);
	if (!currentAsset) {
		return <div />;
	}

	// const src =
	// 	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
	return <Video src={staticFile(currentAsset)} />;
};

const Inner: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const {size: previewSize} = useContext(PreviewSizeContext);

	const portalContainer = useRef<HTMLDivElement>(null);
	const {mediaType} = useContext(Internals.CompositionManager);
	const config = useVideoConfig();
	const {checkerboard} = useContext(CheckerboardContext);

	const {centerX, centerY, yCorrection, xCorrection, scale} =
		PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: previewSize.size,
		});

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width: config.width * scale,
			height: config.height * scale,
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
				<AssetComponent style={style} />
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
