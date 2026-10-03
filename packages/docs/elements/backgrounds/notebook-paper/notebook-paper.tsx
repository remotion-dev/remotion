import {gridlines} from '@remotion/effects/gridlines';
import {paper} from '@remotion/effects/paper';
import React from 'react';
import {
	Interactive,
	Solid,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';

const NotebookPaperInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const {height, width} = useVideoConfig();

	return (
		<Solid
			style={style}
			color={'#ffffff'}
			width={width}
			height={height}
			effects={[
				paper({
					amount: 0.38,
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
					gridSize: 54,
					lineWidth: 3.4,
					lineColor: 'rgba(76, 101, 128, 0.16)',
				}),
			]}
		/>
	);
};

export const NotebookPaper = Interactive.withSchema({
	Component: NotebookPaperInner,
	componentName: '<NotebookPaper>',
	schema: {},
	wrapInSequence: true,
});
