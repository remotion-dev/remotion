import {cylinder} from '@remotion/effects/cylinder';
import React from 'react';
import {
	HtmlInCanvas,
	Interactive,
	useCurrentFrame,
	useVideoConfig,
	type InteractivitySchema,
} from 'remotion';

type CylinderTextProps = {
	readonly text?: string;
	readonly color?: string;
	readonly speed?: number;
	readonly tilt?: number;
};

const cylinderTextSchema = {
	text: {
		type: 'string',
		default: 'ALWAYS IN MOTION • ALWAYS IN MOTION • ',
		description: 'Text',
	},
	color: {type: 'color', default: '#182033', description: 'Text color'},
	speed: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 1 / 6,
		description: 'Revolutions per second',
		hiddenFromList: false,
	},
	tilt: {
		type: 'rotation-degrees',
		min: 0,
		max: 85,
		default: 52,
		description: 'Tilt',
	},
} as const satisfies InteractivitySchema;

const CylinderTextInner: React.FC<CylinderTextProps> = ({
	text = 'ALWAYS IN MOTION • ALWAYS IN MOTION • ',
	color = '#182033',
	speed = 1 / 6,
	tilt = 52,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			name="Cylinder"
			effects={[
				cylinder({
					radius: Math.min(width, height) * 0.42,
					rotation: (frame / fps) * speed * 360,
					rotationX: tilt,
					rotationZ: -18,
					shading: 0.35,
				}),
			]}
		>
			<div
				style={{
					alignItems: 'center',
					color,
					display: 'flex',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: width / 22,
					fontWeight: 700,
					height: '100%',
					justifyContent: 'center',
					lineHeight: 1,
					whiteSpace: 'nowrap',
					width: '100%',
				}}
			>
				{text}
			</div>
		</HtmlInCanvas>
	);
};

export const CylinderText = Interactive.create({
	Component: CylinderTextInner,
	componentName: '<CylinderText>',
	layout: 'absolute-fill',
	schema: cylinderTextSchema,
});
