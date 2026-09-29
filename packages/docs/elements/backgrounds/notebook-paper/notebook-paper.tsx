import {gridlines} from '@remotion/effects/gridlines';
import {paper} from '@remotion/effects/paper';
import React from 'react';
import {
	Interactive,
	Solid,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type NotebookPaperProps = InteractiveTransformProps & {
	readonly gridSize?: number;
	readonly lineWidth?: number;
	readonly lineColor?: string;
	readonly paperAmount?: number;
};

const notebookPaperSchema = {
	gridSize: {
		type: 'number',
		min: 1,
		step: 1,
		default: 54,
		description: 'Grid size',
		hiddenFromList: false,
	},
	lineWidth: {
		type: 'number',
		min: 0,
		step: 0.1,
		default: 3.4,
		description: 'Line width',
		hiddenFromList: false,
	},
	lineColor: {
		type: 'color',
		default: 'rgba(76, 101, 128, 0.16)',
		description: 'Line color',
	},
	paperAmount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.38,
		description: 'Paper texture amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const NotebookPaperInner: React.FC<NotebookPaperProps> = ({
	gridSize = 54,
	lineWidth = 3.4,
	lineColor = 'rgba(76, 101, 128, 0.16)',
	paperAmount = 0.38,
	style,
}) => {
	const {height, width} = useVideoConfig();

	return (
		<Solid
			showInTimeline={false}
			style={{position: 'absolute', left: 0, top: 0, ...style}}
			color={'#ffffff'}
			width={width}
			height={height}
			effects={[
				paper({
					amount: paperAmount,
					colorFront: 'white',
					colorBack: 'white',
					contrast: 0.18,
					roughness: 0.18,
					fiber: 0.28,
					crumples: 0.1,
					folds: 0.12,
					seed: 24,
					scale: 0.8,
					drops: 0,
				}),
				gridlines({
					gridSize,
					lineWidth,
					lineColor,
				}),
			]}
		/>
	);
};

export const NotebookPaper = Interactive.withSchema({
	Component: NotebookPaperInner,
	componentName: '<NotebookPaper>',
	schema: notebookPaperSchema,
	wrapInSequence: true,
});
