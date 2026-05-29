import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<h3>Effects</h3>
			<Grid>
				<TOCItem link="/docs/starburst/starburst-effect">
					<strong>
						<code>starburst()</code>
					</strong>
					<div>Apply a starburst ray effect</div>
				</TOCItem>
			</Grid>
			<h3>Components</h3>
			<Grid>
				<TOCItem link="/docs/starburst/starburst">
					<strong>{'<Starburst>'}</strong>
					<div>Render a starburst ray effect</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
