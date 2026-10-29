import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/canvas-capture/installation">
					<strong>Installation</strong>
					<div>Install the Canvas Capture extension</div>
				</TOCItem>
				<TOCItem link="/docs/canvas-capture/how-to-use">
					<strong>Record a Video</strong>
					<div>Record, save, and edit your interactions</div>
				</TOCItem>
				<TOCItem link="/docs/canvas-capture/agentic-shot-setup">
					<strong>Agentic shot setup</strong>
					<div>Let an agent frame and preview your shot</div>
				</TOCItem>
				<TOCItem link="/docs/canvas-capture/development">
					<strong>Development</strong>
					<div>Load Canvas Capture as an unpacked extension</div>
				</TOCItem>
				<TOCItem link="/docs/canvas-capture/metadata">
					<strong>Recording metadata</strong>
					<div>TypeScript schema for the data embedded in recordings</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
