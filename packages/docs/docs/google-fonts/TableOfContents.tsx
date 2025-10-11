import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/google-fonts/load-font">
					<strong>loadFont()</strong>
					<div>Load a Google Font</div>
				</TOCItem>
				<TOCItem link="/docs/google-fonts/get-available-fonts">
					<strong>getAvailableFonts()</strong>
					<div>Static list of available fonts</div>
				</TOCItem>
				<TOCItem link="/docs/google-fonts/get-info">
					<strong>getInfo()</strong>
					<div>Metadata about a specific font</div>
				</TOCItem>
				<TOCItem link="/docs/google-fonts/load-font-from-info">
					<strong>loadFontFromInfo()</strong>
					<div>Load a Google Font based on metadata</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
