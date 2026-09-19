import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/codemods/add-solid">
				<strong>addSolid()</strong>
				<div>Add a Solid to a composition source file</div>
			</TOCItem>
		</Grid>
	);
};
