import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/opentimeline/import">
				<strong>Importing</strong>
				<div>In the Studio, via the CLI, or programmatically</div>
			</TOCItem>
			<TOCItem link="/docs/opentimeline/export">
				<strong>Exporting</strong>
				<div>Export as .otio using the Remotion Agent Skill.</div>
			</TOCItem>
		</Grid>
	);
};
