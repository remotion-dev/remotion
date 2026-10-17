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
					color: '#182033',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 80,
					fontWeight: 700,
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				<div style={{flex: 1, textAlign: 'center'}}>MAKE IT MOVE •</div>
				<div style={{flex: 1, textAlign: 'center'}}>MAKE IT MOVE •</div>
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
		<AbsoluteFill style={{backgroundColor: '#eef1f4'}}>
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
