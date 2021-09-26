import {PlayerInternals, Size} from '@remotion/player';
import React, {Suspense, useContext, useMemo} from 'react';
import {getInputProps, Internals, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
	getCheckerboardBackgroundSize,
} from '../helpers/checkerboard-background';
import {CheckerboardContext} from '../state/checkerboard';
import {PreviewSizeContext} from '../state/preview-size';
import {IFrameWrapper} from './IFrameWrapper';

const checkerboardSize = 49;

export const Container = styled.div<{
	scale: number;
	xCorrection: number;
	yCorrection: number;
	width: number;
	height: number;
	checkerboard: boolean;
}>`
	transform: scale(${(props): number => props.scale});
	margin-left: ${(props): number => props.xCorrection}px;
	margin-top: ${(props): number => props.yCorrection}px;
	width: ${(props): number => props.width}px;
	height: ${(props): number => props.height}px;
	display: flex;
	position: absolute;
	background-color: ${(props) =>
		checkerboardBackgroundColor(props.checkerboard)};
	background-image: ${(props) =>
		checkerboardBackgroundImage(props.checkerboard)};
	background-size: ${getCheckerboardBackgroundSize(
		checkerboardSize
	)}; /* Must be a square */
	background-position: ${getCheckerboardBackgroundPos(
		checkerboardSize
	)}; /* Must be half of one side of the square */
`;

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

	const Component = video ? video.component : null;
	const inputProps = getInputProps();

	return (
		<Suspense fallback={<div>loading...</div>}>
			<div style={outer}>
				<Container
					{...{
						checkerboard,
						scale,
						xCorrection,
						yCorrection,
						width: config.width,
						height: config.height,
					}}
				>
					<IFrameWrapper width={config.width} height={config.height}>
						{Component ? (
							<Component
								{...(((video?.props as unknown) as {}) ?? {})}
								{...inputProps}
							/>
						) : null}
					</IFrameWrapper>
				</Container>
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
