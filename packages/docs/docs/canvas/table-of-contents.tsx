import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/canvas/canvas">
					<strong>{'<Canvas>'}</strong>
					<div>Preview a composition with selectable, movable outlines</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/create-canvas-controller">
					<strong>createCanvasController()</strong>
					<div>Connect the canvas, timeline, selection, and hover</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/use-canvas-controller">
					<strong>useCanvasController()</strong>
					<div>Create a stable controller in a React component</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/create-canvas-selection-controller">
					<strong>createCanvasSelectionController()</strong>
					<div>Create a standalone selection store</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/create-canvas-hover-controller">
					<strong>createCanvasHoverController()</strong>
					<div>Create a standalone hover store</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/use-canvas-selection">
					<strong>useCanvasSelection()</strong>
					<div>Subscribe to selected layers and other items</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/use-canvas-sequence-hover">
					<strong>useCanvasSequenceHover()</strong>
					<div>Synchronize hover between a layer list and the canvas</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/use-canvas-hover">
					<strong>useCanvasHover()</strong>
					<div>Subscribe to the current hovered sequence</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-sequence-node-path-info">
					<strong>getCanvasSequenceNodePathInfo()</strong>
					<div>Resolve a timeline track's selection identity</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-sequence-source-location">
					<strong>getCanvasSequenceSourceLocation()</strong>
					<div>Find where a timeline track's JSX element was written</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-selection-item-key">
					<strong>getCanvasSelectionItemKey()</strong>
					<div>Compare selection items by identity</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-keyframes">
					<strong>getCanvasKeyframes()</strong>
					<div>Place the keyframes of a prop on the timeline</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-keyframe-toggle">
					<strong>getCanvasKeyframeToggle()</strong>
					<div>Add, remove and navigate keyframes at a frame</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/start-canvas-keyframe-drag">
					<strong>startCanvasKeyframeDrag()</strong>
					<div>Move keyframes along the timeline with the pointer</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-prop-value-at-frame">
					<strong>getCanvasPropValueAtFrame()</strong>
					<div>Read the value of a prop at a frame from the source</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-keyframe-source-frame">
					<strong>getCanvasKeyframeSourceFrame()</strong>
					<div>Convert a composition frame to the interpolation clock</div>
				</TOCItem>
				<TOCItem link="/docs/canvas/get-canvas-keyframe-display-frame">
					<strong>getCanvasKeyframeDisplayFrame()</strong>
					<div>Convert an interpolation frame to the composition</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
