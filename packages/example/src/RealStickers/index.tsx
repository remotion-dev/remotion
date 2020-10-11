import {interpolate, registerVideo, useVideoConfig} from '@remotion/core';
import React from 'react';
import {seeds} from '../seeds';
import {output} from './data';

export const RealStickers = () => {
	const videoConfig = useVideoConfig();
	return (
		<div
			style={{
				width: videoConfig.width,
				height: videoConfig.height,
				backgroundColor: 'white',
			}}
		>
			{output.map((o, i) => {
				const xOffset = interpolate({
					input: seeds[i],
					inputRange: [0, 1],
					outputRange: [0, videoConfig.width],
				});
				const yOffset = interpolate({
					input: seeds[seeds.length - i],
					inputRange: [0, 1],
					outputRange: [0, videoConfig.height],
				});
				return (
					<img
						src={`https://anysticker.imgix.net/${o.source}?w=200&h=200&fm=png&fill=solid&fit=fill&auto=compress`}
						style={{}}
					></img>
				);
			})}
		</div>
	);
};

registerVideo(RealStickers, {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 30 * 2,
});
