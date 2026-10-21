import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/wordart/word-art">
				<strong>{'<WordArt>'}</strong>
				<div>Render and animate classic decorative text</div>
			</TOCItem>
		</Grid>
	);
};
