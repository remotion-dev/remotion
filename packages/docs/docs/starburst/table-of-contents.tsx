import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/starburst/starburst">
					<strong>{'<Starburst>'}</strong>
					<div>Render a starburst ray effect</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
