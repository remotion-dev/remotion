import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => (
	<Grid>
		<TOCItem link="/docs/effects/grow-bounds">
			<strong>Grow bounds</strong>
			<div>
				Give shadows, blurs, and distortions room beyond an element’s edges.
			</div>
		</TOCItem>
		<TOCItem link="/docs/effects/output-size">
			<strong>Effects output size</strong>
			<div>Choose the resolution at which effects process an element.</div>
		</TOCItem>
		<TOCItem link="/docs/effects/custom">
			<strong>Make your own effect</strong>
			<div>Turn an icon into a blue silhouette with a canvas effect.</div>
		</TOCItem>
	</Grid>
);
