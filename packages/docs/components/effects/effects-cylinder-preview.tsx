import {cylinder, type CylinderRender} from '@remotion/effects/cylinder';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';

export const CYLINDER_TEXT_IMAGE_SRC = 'img/effects-cylinder-text.png';

export const CylinderTextSource: React.FC = () => {
	return (
		<AbsoluteFill style={{justifyContent: 'center'}}>
			<div
				style={{
					display: 'flex',
					color: 'white',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 60,
					fontWeight: 700,
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				<div style={{flex: 1, textAlign: 'center'}}>ALWAYS IN MOTION •</div>
				<div style={{flex: 1, textAlign: 'center'}}>ALWAYS IN MOTION •</div>
			</div>
		</AbsoluteFill>
	);
};

export const EffectsCylinderPreview: React.FC<{
	readonly radius: number;
	readonly rotation: number;
	readonly rotationX: number;
	readonly rotationY: number;
	readonly rotationZ: number;
	readonly position: readonly [number, number];
	readonly render: CylinderRender;
	readonly shading: number;
}> = (params) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<CanvasImage
				src={staticFile(CYLINDER_TEXT_IMAGE_SRC)}
				width={1280}
				height={720}
				fit="cover"
				effects={[cylinder(params)]}
			/>
		</AbsoluteFill>
	);
};
