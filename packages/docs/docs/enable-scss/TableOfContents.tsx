import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/enable-scss/enable-scss">
					<strong>{'enableScss()'}</strong>
					<div>Override the Webpack config to enable SCSS</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
