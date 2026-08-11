import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media/video">
					<strong>{'<Video>'}</strong>
					<div>WebCodecs-based tag for embedding videos</div>
				</TOCItem>
				<TOCItem link="/docs/media/audio">
					<strong>{'<Audio>'}</strong>
					<div>WebCodecs-based tag for embedding audio</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
