import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {
	Audio,
	Img,
	Internals,
	staticFile,
	useVideoConfig,
	Video,
} from 'remotion';
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
		throw new Error('File name is null');
	}

	console.log('Filename: ', fileName);
	const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
	const videoExtensions = ['mp4', 'avi', 'mkv', 'mov'];
	const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

	const fileExtension = fileName.split('.').pop()?.toLowerCase();
	console.log('fileextension; ', fileExtension);
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

const AssetComponent: React.FC = () => {
	const {currentAsset} = useContext(Internals.CompositionManager);
	const fileType = getFileType(currentAsset);
	if (!currentAsset) {
		return <div />;
	}

	if (fileType === 'audio') {
		return (
			<div>
				<Audio src={staticFile(currentAsset)} />
			</div>
		);
	}

	if (fileType === 'video') {
		return <Video src={staticFile(currentAsset)} />;
	}

	if (fileType === 'image') {
		return <Img src={staticFile(currentAsset)} />;
	}

	return <div> No file found</div>;
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
				<AssetComponent />
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
