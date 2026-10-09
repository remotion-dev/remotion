import type React from 'react';
import {useLayoutEffect, useRef} from 'react';
import {
	Interactive,
	type InteractivitySchema,
	useCurrentFrame,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {BlueprintRenderer} from './renderer';

type BlueprintStageProps = {
	readonly lineColor: string;
	readonly lineWidth: number;
	readonly occluderColor?: string;
	readonly stillTimeSeconds?: number;
};

const BlueprintStageInner: React.FC<BlueprintStageProps> = ({
	lineColor,
	lineWidth,
	occluderColor,
	stillTimeSeconds,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {isRendering} = useRemotionEnvironment();
	const container = useRef<HTMLDivElement>(null);
	const renderer = useRef<BlueprintRenderer | null>(null);
	// Match `--scale` when rendering; the Studio preview stays at 1x.
	const pixelRatio = isRendering ? window.devicePixelRatio : 1;

	// Each mount gets its own canvas, so a remount never reuses a lost context.
	useLayoutEffect(() => {
		const canvas = document.createElement('canvas');
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.display = 'block';
		container.current?.appendChild(canvas);
		renderer.current = new BlueprintRenderer(canvas, width, height, pixelRatio);
		return () => {
			renderer.current?.dispose();
			renderer.current = null;
			canvas.remove();
		};
	}, [width, height, pixelRatio]);

	useLayoutEffect(() => {
		renderer.current?.setStyle(lineColor, lineWidth, occluderColor);
		renderer.current?.draw(stillTimeSeconds ?? frame / fps);
	}, [
		frame,
		fps,
		lineColor,
		lineWidth,
		occluderColor,
		stillTimeSeconds,
		width,
		height,
		pixelRatio,
	]);

	return <div ref={container} style={{position: 'absolute', inset: 0}} />;
};

const blueprintStageSchema = {
	lineColor: {type: 'color', default: '#1F4FD8', description: 'Line color'},
	lineWidth: {
		type: 'number',
		default: 1.6,
		min: 0.5,
		max: 6,
		step: 0.1,
		description: 'Line width (px)',
		hiddenFromList: false,
	},
	occluderColor: {
		type: 'color',
		default: '#FFFFFF',
		description: 'Color of hidden-line surfaces',
	},
} as const satisfies InteractivitySchema;

export const BlueprintStage = Interactive.withSchema({
	Component: BlueprintStageInner,
	componentName: '<BlueprintStage>',
	schema: blueprintStageSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});
