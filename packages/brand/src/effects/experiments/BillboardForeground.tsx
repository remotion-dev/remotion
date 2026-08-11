import {cornerPin} from '@remotion/effects/corner-pin';
import React from 'react';
import {AbsoluteFill, HtmlInCanvas, Img, staticFile} from 'remotion';

const BILLBOARD_ASPECT_RATIO = '48 / 14';
const BILLBOARD_SOURCE_WIDTH = 2400;
const BILLBOARD_SOURCE_HEIGHT = Math.round((2400 / 48) * 14);

const fullscreenImage: React.CSSProperties = {
	height: '100%',
	left: 0,
	position: 'absolute',
	top: 0,
	width: '100%',
};

const backgroundImage: React.CSSProperties = {
	...fullscreenImage,
	objectFit: 'cover',
};

const sourceLogo: React.CSSProperties = {
	width: '50%',
};

export const BillboardForeground: React.FC = () => {
	return (
		<AbsoluteFill>
			<Img
				src={staticFile('effects-experiments/bulletin-billboard.jpg')}
				style={backgroundImage}
			/>
			<HtmlInCanvas
				width={BILLBOARD_SOURCE_WIDTH}
				height={BILLBOARD_SOURCE_HEIGHT}
				style={{
					aspectRatio: BILLBOARD_ASPECT_RATIO,
					left: 0,
					position: 'absolute',
					top: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					scale: 0.378,
					translate: '-683.5px -119.4px',
				}}
				effects={[
					cornerPin({
						topLeft: [0.15, 0.168],
						topRight: [0.627, 0.212],
						bottomRight: [0.626, 0.755],
						bottomLeft: [0.147, 0.727],
					}),
				]}
				pixelDensity={2}
			>
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'white',
					}}
				>
					<Img
						src={staticFile('effects-experiments/element-0.png')}
						style={sourceLogo}
					/>
				</AbsoluteFill>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};
