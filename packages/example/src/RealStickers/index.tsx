import {
	interpolate,
	registerVideo,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {output} from './data';

const svgPath = require('svg-path-properties');

const spacePerSticker = 270;
const stickersInSmallestCircle = 7;
const stickerSize = 180;

export const RealStickers = () => {
	const videoConfig = useVideoConfig();
	const _cData = (function () {
		let data: {
			cx: number;
			cy: number;
			rx: number;
			ry: number;
			stickersLength: number;
		}[] = [];
		const circumferenceNeededForSmallestCircle =
			spacePerSticker * stickersInSmallestCircle;
		let radius = circumferenceNeededForSmallestCircle / (Math.PI * 2);
		// eslint-disable-next-line fp/no-mutating-methods
		data.push({
			cx: videoConfig.width / 2,
			cy: videoConfig.height / 2,
			rx: radius,
			ry: radius,
			stickersLength: stickersInSmallestCircle,
		});
		for (let i = 0; i < 10; i++) {
			const nextRadius = radius + spacePerSticker * 1.2;
			radius = nextRadius;
			const stickersFittingInNextRadius = Math.floor(
				((radius * Math.PI * 2) / circumferenceNeededForSmallestCircle) *
					stickersInSmallestCircle
			);
			data.push({
				cx: videoConfig.width / 2,
				cy: videoConfig.height / 2,
				ry: nextRadius,
				rx: nextRadius,
				stickersLength: stickersFittingInNextRadius,
			});
		}
		return data;
	})();

	const frame = useCurrentFrame();

	const frameToPick = Math.round(
		interpolate({
			input: frame,
			inputRange: [0, videoConfig.durationInFrames],
			outputRange: [1, 221],
			extrapolateLeft: 'clamp',
		})
	);
	const f = require('./imgs/Rotato Frame ' + frameToPick + '.png').default;
	return (
		<div
			style={{
				width: videoConfig.width,
				height: videoConfig.height,
				backgroundColor: 'white',
			}}
		>
			<div
				style={{
					transform: 'scale(0.7)',
					width: videoConfig.width,
					height: videoConfig.height,
				}}
			>
				{output.map((o, i) => {
					const circle = (function () {
						let totalStickersFitted = 0;
						for (let j = 0; j < _cData.length; j++) {
							const c = _cData[j];
							totalStickersFitted += c.stickersLength;
							if (totalStickersFitted > i) {
								return {
									circle: j,
									indexOfCircle: i - totalStickersFitted + c.stickersLength,
								};
							}
						}
						throw new Error('wtf');
					})();
					const {cx, cy, rx, ry, stickersLength} = _cData[circle.circle];
					const d = `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${
						rx * 2
					},0a${rx},${ry} 0 1,0 -${rx * 2},0`;

					const p = svgPath.svgPathProperties(d);
					const length = p.getTotalLength();
					const point = p.getPointAtLength(
						(length / stickersLength) * circle.indexOfCircle
					);
					return (
						<img
							src={`https://anysticker.imgix.net/${o.source}?w=${stickerSize}&h=${stickerSize}&fm=png&fill=solid&fit=fill&auto=compress`}
							style={{
								position: 'absolute',
								left: point.x - stickerSize / 2,
								top: point.y - stickerSize / 2,
							}}
						></img>
					);
				})}
				<img src={f} style={{position: 'absolute'}}></img>
			</div>
		</div>
	);
};

registerVideo(RealStickers, {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 30 * 2,
});
