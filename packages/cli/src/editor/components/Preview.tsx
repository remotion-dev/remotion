import React from 'react';
import styled from 'styled-components';
import {useRecoilState} from 'recoil';
import {previewSizeState} from '../state/preview-size';
import {getVideo, useVideoConfig} from '@jonny/motion-core';
import {Size} from '../hooks/get-el-size';

export const Container = styled.div<{
	scale: number;
	xCorrection: number;
	yCorrection: number;
	width: number;
	height: number;
}>`
	transform: scale(${(props): number => props.scale});
	margin-left: ${(props): number => props.xCorrection}px;
	margin-top: ${(props): number => props.yCorrection}px;
	width: ${(props): number => props.width}px;
	height: ${(props): number => props.height}px;
	display: flex;
	position: absolute;
`;

const Video = getVideo();

export const VideoPreview: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const [previewSize] = useRecoilState(previewSizeState);
	const config = useVideoConfig();

	const smallestCanvasSide = Math.min(canvasSize.height, canvasSize.width);
	const smallestVideoSide = Math.min(config.height, config.width);
	const scale =
		previewSize === 'auto'
			? smallestCanvasSide / smallestVideoSide
			: Number(previewSize);
	const correction = 0 - (1 - scale) / 2;
	const xCorrection = correction * config.width;
	const yCorrection = correction * config.height;
	const width = config.width * scale;
	const height = config.height * scale;
	const centerX = canvasSize.width / 2 - width / 2;
	const centerY = canvasSize.height / 2 - height / 2;

	return (
		<div
			style={{
				width: config.width * scale,
				height: config.height * scale,
				display: 'flex',
				position: 'absolute',
				left: centerX,
				top: centerY,
			}}
		>
			<Container
				{...{
					scale,
					xCorrection,
					yCorrection,
					width: config.width,
					height: config.height,
				}}
			>
				<Video />
			</Container>
		</div>
	);
};
