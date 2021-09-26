import {PlayerInternals, Size} from '@remotion/player';
import React, {Suspense, useContext, useMemo} from 'react';
import {getInputProps, Internals, useVideoConfig} from 'remotion';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {CheckerboardContext} from '../state/checkerboard';
import {PreviewSizeContext} from '../state/preview-size';
import {Loading} from './LoadingIndicator';

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
		backgroundSize: getCheckerboardBackgroundSize(
			checkerboardSize
		) /* Must be a square */,
		backgroundPosition: getCheckerboardBackgroundPos(
			checkerboardSize
		) /* Must be half of one side of the square */,
	};
};

const Inner: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const {size: previewSize} = useContext(PreviewSizeContext);
	const video = Internals.useVideo();

	const config = useVideoConfig();
	const {checkerboard} = useContext(CheckerboardContext);

	const {
		centerX,
		centerY,
		yCorrection,
		xCorrection,
		scale,
	} = PlayerInternals.calculateScale({
		canvasSize,
		compositionHeight: config.height,
		compositionWidth: config.width,
		previewSize,
	});

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width: config.width * scale,
			height: config.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX,
			top: centerY,
			overflow: 'hidden',
		};
	}, [centerX, centerY, config.height, config.width, scale]);

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

	const Component = video ? video.component : null;
	const inputProps = getInputProps();

	return (
		<Suspense fallback={<Loading />}>
			<div style={outer}>
				<div style={style}>
					{Component ? (
						<Component
							{...(((video?.props as unknown) as {}) ?? {})}
							{...inputProps}
						/>
					) : null}
				</div>
			</div>
		</Suspense>
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
