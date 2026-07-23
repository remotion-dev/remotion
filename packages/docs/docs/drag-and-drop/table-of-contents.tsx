import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

const apis = [
	['makeDragData()', 'make-drag-data', 'Construct one complete drag item'],
	['parseDragData()', 'parse-drag-data', 'Parse one complete drag item'],
	[
		'getDragPreviewMetadata()',
		'get-drag-preview-metadata',
		'Read preview metadata during dragover',
	],
] as const;

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			{apis.map(([name, slug, description]) => (
				<TOCItem key={slug} link={`/docs/drag-and-drop/${slug}`}>
					<strong>
						<code>{name}</code>
					</strong>
					<div>{description}</div>
				</TOCItem>
			))}
		</Grid>
	);
};
