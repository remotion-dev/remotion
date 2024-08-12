import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media-parser/parse-media">
					<strong>{'parseMedia()'}</strong>
					<div>Parse a media file.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/node-reader">
					<strong>{'nodeReader'}</strong>
					<div>Read a file from the local file system.</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/fetch-reader">
					<strong>{'fetchReader'}</strong>
					<div>
						Read a file using <code>fetch()</code>.
					</div>
				</TOCItem>
				<TOCItem link="/docs/media-parser/web-file-reader">
					<strong>{'webFileReader'}</strong>
					<div>
						Read a file from <code>&lt;input type=&quot;file&quot;&gt;</code>.
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
