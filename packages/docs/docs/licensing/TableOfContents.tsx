import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/webcodecs/convert-media">
					<strong>{'convertMedia()'}</strong>
					<div>Converts a video using WebCodecs and Media Parser</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
