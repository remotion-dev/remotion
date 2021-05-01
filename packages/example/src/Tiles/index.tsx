import {mix} from 'polished';
import React from 'react';
import {spring, SpringConfig, useCurrentFrame, useVideoConfig} from 'remotion';
import {Tile} from './Tile';

const BRAND_GRADIENT = ['#5851db', '#405de6'];
const solidBrand = mix(0.5, BRAND_GRADIENT[0], BRAND_GRADIENT[1]);

const Tiles: React.FC = () => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	const springConfig: SpringConfig = {
		damping: 50,
		mass: 0.1,
		stiffness: 10,
		overshootClamping: false,
	};

	const scale = spring({
		config: springConfig,
		from: 1,
		to: 3.3,
		fps: videoConfig.fps,
		frame,
	});
	const outerScale = spring({
		config: springConfig,
		from: 1,
		frame: Math.max(0, frame - 20),
		to: 3,
		fps: videoConfig.fps,
	});
	const rotate = spring({
		config: springConfig,
		fps: videoConfig.fps,
		frame: Math.max(0, frame - 20),
		from: -100,
		to: 0,
	});
	return (
		<div
			style={{
				backgroundColor: solidBrand,
				flex: 1,
			}}
		>
			<div
				style={{
					transform: `scale(${outerScale})`,
					width: videoConfig.width,
					height: videoConfig.height,
				}}
			>
				<div
					style={{
						transform: `scale(${scale}) rotate(${rotate}deg)`,
						width: videoConfig.width,
						height: videoConfig.height,
					}}
				>
					{new Array(40)
						.fill(true)
						.map((_, i) => i)
						.map((i) => {
							return <Tile key={i} index={i} />;
						})}
				</div>
			</div>
		</div>
	);
};

export default Tiles;
