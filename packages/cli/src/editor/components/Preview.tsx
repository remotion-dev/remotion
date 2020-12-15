import {useVideo, useVideoConfig} from '@remotion/core';
import React, {Suspense} from 'react';
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

export const VideoPreview: React.FC<{
	canvasSize: Size;
}> = ({canvasSize}) => {
	const video = useVideo();
	const [previewSize] = useRecoilState(previewSizeState);
	const config = useVideoConfig();

	if (!video) {
		return null;
	}

	const heightRatio = canvasSize.height / config.height;
	const widthRatio = canvasSize.width / config.width;

	const ratio = Math.min(heightRatio, widthRatio);

	const scale = previewSize === 'auto' ? ratio : Number(previewSize);
	const correction = 0 - (1 - scale) / 2;
	const xCorrection = correction * config.width;
	const yCorrection = correction * config.height;
	const width = config.width * scale;
	const height = config.height * scale;
	const centerX = canvasSize.width / 2 - width / 2;
	const centerY = canvasSize.height / 2 - height / 2;

	const Component = video ? video.component : null;

	return (
		<Suspense fallback={<div>loading...</div>}>
			<div
				style={{
					width: config.width * scale,
					height: config.height * scale,
					display: 'flex',
					flexDirection: 'column',
					position: 'absolute',
					left: centerX,
					top: centerY,
					overflow: 'hidden',
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
					{Component ? (
						<Component {...(((video?.props as unknown) as {}) ?? {})} />
					) : null}
				</Container>
			</div>
		</Suspense>
	);
};
