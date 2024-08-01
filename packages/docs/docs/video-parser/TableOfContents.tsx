import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/video-parser/parse-media">
					<strong>{'parseMedia()'}</strong>
					<div>Parse a media file.</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
