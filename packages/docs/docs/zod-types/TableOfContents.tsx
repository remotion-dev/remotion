import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const ZodTypesTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/zod-types/z-color">
					<strong>{'zColor()'}</strong>
					<div>A Zod Type for colors</div>
				</TOCItem>
				<TOCItem link="/docs/zod-types/z-textarea">
					<strong>{'zTextarea()'}</strong>
					<div>A Zod Type for multiple-line text in a textarea</div>
				</TOCItem>
				<TOCItem link="/docs/zod-types/z-matrix">
					<strong>{'zMatrix()'}</strong>
					<div>A Zod Type for editing matrices</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
