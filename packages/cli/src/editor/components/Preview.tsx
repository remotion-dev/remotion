import {getVideo, useVideoConfig} from '@jonny/motion-core';
import React from 'react';
import {useRecoilState} from 'recoil';
import styled from 'styled-components';
import {Size} from '../hooks/get-el-size';
import {previewSizeState} from '../state/preview-size';

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
	background-color: black;
`;

const Video = getVideo();

export const VideoPreview: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const [previewSize] = useRecoilState(previewSizeState);
	const config = useVideoConfig();

	const ratio =
		canvasSize.height < canvasSize.width
			? canvasSize.height / config.height
			: canvasSize.width / config.width;

	console.log({canvasSize, config});
	const scale = previewSize === 'auto' ? ratio : Number(previewSize);
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
				flexDirection: 'column',
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
