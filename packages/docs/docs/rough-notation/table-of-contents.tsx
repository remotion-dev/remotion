import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/rough-notation/annotation-behind">
					<strong>{'<AnnotationBehind>'}</strong>
					<div>Draw an annotation behind the wrapped element</div>
				</TOCItem>
				<TOCItem link="/docs/rough-notation/annotation-on-top">
					<strong>{'<AnnotationOnTop>'}</strong>
					<div>Draw an annotation over the wrapped element</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
