import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/passing-props">
					<strong>Passing props</strong>
					<div>Pass data to a composition</div>
				</TOCItem>
				<TOCItem link="/docs/schemas">
					<strong>Defining a schema</strong>
					<div>Validate and edit input props</div>
				</TOCItem>
				<TOCItem link="/docs/visual-editing">
					<strong>Visual editing</strong>
					<div>Edit props in Remotion Studio</div>
				</TOCItem>
				<TOCItem link="/docs/data-fetching">
					<strong>Data fetching</strong>
					<div>Fetch data before rendering</div>
				</TOCItem>
				<TOCItem link="/docs/dynamic-metadata">
					<strong>Variable metadata</strong>
					<div>Calculate dimensions, duration, and props</div>
				</TOCItem>
				<TOCItem link="/docs/props-resolution">
					<strong>How props get resolved</strong>
					<div>Understand how Remotion combines props</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
