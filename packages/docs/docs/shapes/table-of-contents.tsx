import {
	makeArrow,
	makeCircle,
	makeEllipse,
	makeHeart,
	makePie,
	makePolygon,
	makeRect,
	makeSpark,
	makeStar,
	makeTriangle,
} from '@remotion/shapes';
import React from 'react';
import {
	getDefaultShapeComponentProps,
	makeDefaultShapeComponentDragData,
	setComponentDragData,
} from '../../components/shapes/shape-component-drag-data';
import {
	type ShapeName,
	shapeComponents,
} from '../../components/shapes/shapes-info';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

type ShapeInfo = {
	readonly path: string;
	readonly width: number;
	readonly height: number;
};

const shapeItem: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 16,
	justifyContent: 'space-between',
};

const shapeItemText: React.CSSProperties = {
	minWidth: 0,
};

const shapeThumbnailContainer: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'var(--ifm-color-emphasis-100)',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 6,
	display: 'flex',
	flexShrink: 0,
	height: 64,
	justifyContent: 'center',
	pointerEvents: 'none',
	width: 64,
};

const shapeThumbnail: React.CSSProperties = {
	display: 'block',
};

const getProp = (
	props: Record<string, string | number | boolean>,
	name: string,
) => props[name];

const getNumber = (
	props: Record<string, string | number | boolean>,
	name: string,
) => {
	const value = getProp(props, name);
	if (typeof value !== 'number') {
		throw new Error(`Expected ${name} to be a number`);
	}

	return value;
};

const getBoolean = (
	props: Record<string, string | number | boolean>,
	name: string,
) => {
	const value = getProp(props, name);
	if (typeof value !== 'boolean') {
		throw new Error(`Expected ${name} to be a boolean`);
	}

	return value;
};

const getDirection = (
	props: Record<string, string | number | boolean>,
	name: string,
) => {
	const value = getProp(props, name);
	if (
		value !== 'left' &&
		value !== 'right' &&
		value !== 'up' &&
		value !== 'down'
	) {
		throw new Error(`Expected ${name} to be a direction`);
	}

	return value;
};

const makeDefaultShapeInfo = (shape: ShapeName): ShapeInfo => {
	const props = Object.fromEntries(
		getDefaultShapeComponentProps(shape).map((prop) => [prop.name, prop.value]),
	);

	switch (shape) {
		case 'Arrow':
			return makeArrow({
				length: getNumber(props, 'length'),
				headWidth: getNumber(props, 'headWidth'),
				headLength: getNumber(props, 'headLength'),
				shaftWidth: getNumber(props, 'shaftWidth'),
				direction: getDirection(props, 'direction'),
			});
		case 'Circle':
			return makeCircle({radius: getNumber(props, 'radius')});
		case 'Ellipse':
			return makeEllipse({
				rx: getNumber(props, 'rx'),
				ry: getNumber(props, 'ry'),
			});
		case 'Heart':
			return makeHeart({
				height: getNumber(props, 'height'),
				aspectRatio: getNumber(props, 'aspectRatio'),
				bottomRoundnessAdjustment: getNumber(
					props,
					'bottomRoundnessAdjustment',
				),
				depthAdjustment: getNumber(props, 'depthAdjustment'),
			});
		case 'Pie':
			return makePie({
				radius: getNumber(props, 'radius'),
				progress: getNumber(props, 'progress'),
				closePath: getBoolean(props, 'closePath'),
				counterClockwise: getBoolean(props, 'counterClockwise'),
				rotation: getNumber(props, 'rotation'),
			});
		case 'Polygon':
			return makePolygon({
				points: getNumber(props, 'points'),
				radius: getNumber(props, 'radius'),
				cornerRadius: getNumber(props, 'cornerRadius'),
			});
		case 'Rect':
			return makeRect({
				width: getNumber(props, 'width'),
				height: getNumber(props, 'height'),
				cornerRadius: getNumber(props, 'cornerRadius'),
			});
		case 'Spark':
			return makeSpark({
				innerRadius: getNumber(props, 'innerRadius'),
				outerRadius: getNumber(props, 'outerRadius'),
				cornerRadius: getNumber(props, 'cornerRadius'),
			});
		case 'Star':
			return makeStar({
				points: getNumber(props, 'points'),
				innerRadius: getNumber(props, 'innerRadius'),
				outerRadius: getNumber(props, 'outerRadius'),
				cornerRadius: getNumber(props, 'cornerRadius'),
			});
		case 'Triangle':
			return makeTriangle({
				length: getNumber(props, 'length'),
				direction: getDirection(props, 'direction'),
				cornerRadius: getNumber(props, 'cornerRadius'),
			});
	}
};

const ShapeDragPreview = React.forwardRef<SVGSVGElement, {shape: ShapeName}>(
	({shape}, ref) => {
		const shapeInfo = makeDefaultShapeInfo(shape);
		const padding = Math.max(shapeInfo.width, shapeInfo.height) * 0.08;

		return (
			<div style={shapeThumbnailContainer}>
				<svg
					ref={ref}
					width="48"
					height="48"
					viewBox={`${-padding} ${-padding} ${shapeInfo.width + padding * 2} ${
						shapeInfo.height + padding * 2
					}`}
					style={shapeThumbnail}
				>
					<path d={shapeInfo.path} fill="#0b84ff" />
				</svg>
			</div>
		);
	},
);

ShapeDragPreview.displayName = 'ShapeDragPreview';

const ShapeTOCItem: React.FC<{
	readonly shape: ShapeName;
}> = ({shape}) => {
	const dragImageRef = React.useRef<SVGSVGElement>(null);

	return (
		<TOCItem
			link={'/docs/shapes/' + shape.toLowerCase()}
			draggable
			onDragStart={(e) => {
				setComponentDragData({
					dataTransfer: e.dataTransfer,
					dragData: makeDefaultShapeComponentDragData(shape),
					dragImage: dragImageRef.current,
				});
			}}
			title="Drag this shape into Remotion Studio"
		>
			<div style={shapeItem}>
				<div style={shapeItemText}>
					<strong>{'<' + shape + '/>'}</strong>
					<div>Render a {shape.toLowerCase()}</div>
				</div>
				<ShapeDragPreview ref={dragImageRef} shape={shape} />
			</div>
		</TOCItem>
	);
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				{shapeComponents.map((c) => {
					return (
						<React.Fragment key={c.shape}>
							<TOCItem link={'/docs/shapes/make-' + c.shape.toLowerCase()}>
								<strong>make{c.shape}()</strong>
								<div>Generate SVG Path for a {c.shape.toLowerCase()}</div>
							</TOCItem>
							<ShapeTOCItem shape={c.shape} />
						</React.Fragment>
					);
				})}
			</Grid>
		</div>
	);
};
