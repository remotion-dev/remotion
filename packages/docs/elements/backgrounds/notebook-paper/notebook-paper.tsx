import {gridlines} from '@remotion/effects/gridlines';
import {paper} from '@remotion/effects/paper';
import React from 'react';
import {Solid, useVideoConfig} from 'remotion';

export const NotebookPaper: React.FC = () => {
	const {height, width} = useVideoConfig();

	return (
		<Solid
			color="#f5f0e6"
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
				}),
				gridlines({
					gridSize: 54,
					lineWidth: 1.25,
					lineColor: 'rgba(76, 101, 128, 0.16)',
				}),
			]}
		/>
	);
};
