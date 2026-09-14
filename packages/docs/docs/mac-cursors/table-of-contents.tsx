import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/mac-cursors/mac-os-cursor">
				<strong>{'<MacOSCursor>'}</strong>
				<div>Render a macOS or custom CSS cursor</div>
			</TOCItem>
		</Grid>
	);
};
