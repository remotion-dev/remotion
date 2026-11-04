import {dropShadow} from '@remotion/effects/drop-shadow';
import {paper} from '@remotion/effects/paper';
import {roughenEdges} from '@remotion/effects/roughen-edges';
import React, {useMemo} from 'react';
import {CanvasImage} from 'remotion';
import {makeNotebookTexture} from './textures';

export const NotebookSheet: React.FC<{
	readonly name: string;
	readonly width: number;
	readonly height: number;
	readonly holes?: boolean;
	readonly holeSide?: 'left' | 'top';
	readonly margin?: number;
	readonly firstLine?: number;
	readonly seed?: number;
	readonly shadow?: boolean;
	readonly tornness?: number;
	readonly style?: React.CSSProperties;
}> = ({
	name,
	width,
	height,
	holes = true,
	holeSide = 'left',
	margin = 150,
	firstLine = 120,
	seed = 3,
	shadow = true,
	tornness = 12,
	style,
}) => {
	const texture = useMemo(
		() =>
			makeNotebookTexture({width, height, holes, holeSide, margin, firstLine}),
		[width, height, holes, holeSide, margin, firstLine],
	);

	return (
		<CanvasImage
			name={name}
			src={texture}
			width={width}
			height={height}
			fit="fill"
			style={style}
			effects={[
				paper({
					amount: 0.45,
					colorFront: '#ececf0',
					colorBack: '#ffffff',
					contrast: 0.12,
					roughness: 0.15,
					fiber: 0.12,
					fiberSize: 0.15,
					crumples: 0.12,
					crumpleSize: 0.4,
					folds: 0.15,
					foldCount: 2,
					drops: 0,
					seed: seed,
				}),
				roughenEdges({
					amount: 1,
					border: tornness,
					scale: 0.04,
					seed: seed * 31,
				}),
				dropShadow({
					disabled: !shadow,
					radius: 10,
					offsetX: 5,
					offsetY: 8,
					opacity: 0.26,
					color: '#000000',
				}),
			]}
		/>
	);
};
