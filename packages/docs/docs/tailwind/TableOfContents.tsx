import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/tailwind/enable-tailwind">
					<strong>{'enableTailwind()'}</strong>
					<div>Override the Webpack config to enable TailwindCSS</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
