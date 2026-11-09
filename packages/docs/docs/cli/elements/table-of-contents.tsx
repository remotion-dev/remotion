import React from 'react';
import {Grid} from '../../../components/TableOfContents/Grid';
import {TOCItem} from '../../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/cli/elements/use">
					<strong>elements use</strong>
					<div>Install an Element from an Element Library page</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
