import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/canvas-capture/installation">
					<strong>Installation</strong>
					<div>Install the browser and Canvas Capture extension</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
