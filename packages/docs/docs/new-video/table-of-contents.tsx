import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/video">
					<strong>{'<NewVideo>'}</strong>
					<div>Tag for reliable and accurate video embedding</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
