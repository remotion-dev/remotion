import {
	makeAssetDragData,
	makeComponentDragData,
	makeCompositionDragData,
	makeEffectDragData,
	makeElementDragData,
	makeSfxDragData,
} from '@remotion/drag-and-drop';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const payloads = [
	makeAssetDragData('images/logo.png'),
	makeComponentDragData({
		componentName: 'Circle',
		importName: 'Circle',
		importPath: '@remotion/shapes',
		props: [{name: 'radius', value: 100}],
	}),
	makeCompositionDragData({
		compositionId: 'MyVideo',
		compositionFile: 'src/Root.tsx',
	}),
	makeEffectDragData({
		name: 'brightness',
		importPath: '@remotion/effects/brightness',
		config: {brightness: 1.2},
	}),
	makeElementDragData({
		dependencies: [],
		slug: 'titles/lower-third',
		displayName: 'Lower Third',
		sourceCode: 'export const LowerThird = () => null;',
		dimensions: {width: 900, height: 260},
	}),
	makeSfxDragData({
		name: 'Whip',
		url: 'https://remotion.media/whip.wav',
	}),
];

export const DragAndDropExample: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0b0b0f',
				color: 'white',
				fontFamily: 'monospace',
				padding: 40,
			}}
		>
			<pre>{JSON.stringify(payloads, null, 2)}</pre>
		</AbsoluteFill>
	);
};
