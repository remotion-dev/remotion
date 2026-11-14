import {AbsoluteFill} from 'remotion';
import {clipPathCircle} from './clip-path-circle';
import {clipPathEllipse} from './clip-path-ellipse';
import {clipPathInset} from './clip-path-inset';
import {clipPathPath} from './clip-path-path';
import {clipPathPolygon} from './clip-path-polygon';
import {
	clipPathRectangleUnion,
	clipPathRectangleUnionSvgTarget,
} from './clip-path-rectangle-union';
import {clipPathReference} from './clip-path-reference';
import {clipPathShapeReference} from './clip-path-shape-reference';

const shapes = [
	clipPathPolygon,
	clipPathPath,
	clipPathCircle,
	clipPathInset,
	clipPathEllipse,
];
export const clipPathShapes = {
	id: 'clip-path-shapes',
	width: 1000,
	height: 200,
	fps: 30,
	durationInFrames: 1,
	component: () => (
		<AbsoluteFill style={{flexDirection: 'row'}}>
			{shapes.map(({component: Component, id, width, height}) => (
				<div
					key={id}
					style={{position: 'relative', width, height, flexShrink: 0}}
				>
					<Component />
				</div>
			))}
		</AbsoluteFill>
	),
};

const references = [
	clipPathReference,
	clipPathShapeReference,
	clipPathRectangleUnion,
	clipPathRectangleUnionSvgTarget,
];
export const clipPathReferences = {
	id: 'clip-path-references',
	width: Math.max(...references.map(({width}) => width)),
	height: references.reduce((sum, {height}) => sum + height, 0),
	fps: 30,
	durationInFrames: 2,
	component: () => (
		<AbsoluteFill>
			{references.map(({component: Component, id, width, height}) => (
				<div
					key={id}
					style={{position: 'relative', width, height, flexShrink: 0}}
				>
					<Component />
				</div>
			))}
		</AbsoluteFill>
	),
};
