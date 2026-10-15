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
				<TOCItem link="/docs/canvas-capture/agentic-shot-setup">
					<strong>Agentic shot setup</strong>
					<div>Let an agent frame and preview your shot</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
