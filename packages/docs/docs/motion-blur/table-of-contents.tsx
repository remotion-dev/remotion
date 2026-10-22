import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/motion-blur/html-in-canvas-motion-blur">
					<strong>{'<HtmlInCanvasMotionBlur>'}</strong>
					<div>Sample HTML across a frame for the best motion blur result</div>
				</TOCItem>
				<TOCItem link="/docs/motion-blur/camera-motion-blur">
					<strong>{'<CameraMotionBlur>'}</strong>
					<div>Add a natural camera motion blur effect to children</div>
				</TOCItem>
				<TOCItem link="/docs/motion-blur/trail">
					<strong>{'<Trail>'}</strong>
					<div>Add a trail effect to children</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
