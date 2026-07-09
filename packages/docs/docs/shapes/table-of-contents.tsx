import React from 'react';
import {
	makeDefaultShapeComponentDragData,
	setComponentDragData,
} from '../../components/shapes/shape-component-drag-data';
import {getShapeDragInfo} from '../../components/shapes/shape-drag-info';
import {
	type ShapeName,
	shapeComponents,
} from '../../components/shapes/shapes-info';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

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

const ShapeDragPreview = React.forwardRef<SVGSVGElement, {shape: ShapeName}>(
	({shape}, ref) => {
		const dragData = makeDefaultShapeComponentDragData(shape);
		const shapeInfo = getShapeDragInfo(dragData.component);
		if (shapeInfo === null) {
			throw new Error(`Could not get shape info for ${shape}`);
		}

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
					<path d={shapeInfo.path} fill="#000000" />
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
