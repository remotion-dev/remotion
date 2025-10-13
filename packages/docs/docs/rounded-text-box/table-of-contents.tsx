import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/rounded-text-box/create-rounded-text-box">
					<strong>createRoundedTextBox()</strong>
					<div>Create a rounded SVG text box</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
