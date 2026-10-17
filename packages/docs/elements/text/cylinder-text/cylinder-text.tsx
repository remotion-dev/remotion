import {cylinder} from '@remotion/effects/cylinder';
import React from 'react';
import {
	CanvasImage,
	Interactive,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type CylinderTextProps = InteractiveTransformProps & {
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
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const [escapedText, escapedColor] = [text, color].map((value) =>
		value
			.replaceAll('&', '&amp;')
			.replaceAll('"', '&quot;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;'),
	);
	const src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="680" viewBox="0 0 800 680"><text x="0" y="340" dominant-baseline="central" fill="${escapedColor}" font-family="Arial, Helvetica, sans-serif" font-size="90" font-weight="700" textLength="800" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${escapedText}</text></svg>`)}`;

	return (
		<div style={{width: 800, height: 680, ...style}}>
			<CanvasImage
				src={src}
				width={800}
				height={680}
				fit="cover"
				showInTimeline={false}
				style={{width: '100%', height: '100%'}}
				effects={[
					cylinder({
						radius: 320,
						rotation: (frame / fps) * speed * 360,
						rotationX: tilt,
						rotationZ: -18,
						shading: 0.35,
					}),
				]}
			/>
		</div>
	);
};

export const CylinderText = Interactive.create({
	Component: CylinderTextInner,
	componentName: '<CylinderText>',
	layout: 'none',
	schema: cylinderTextSchema,
});
