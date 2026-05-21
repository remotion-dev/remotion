import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/effects/blur">
					<strong>{'blur()'}</strong>
					<div>Gaussian blur for canvas components</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
