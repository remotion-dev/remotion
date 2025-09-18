import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/media/video">
					<strong>{'<Viewo>'}</strong>
					<div>
						WebCodecs-based video tag for efficient and accurate embedding
					</div>
				</TOCItem>
				<TOCItem link="/docs/media/audio">
					<strong>{'<Audio>'}</strong>
					<div>
						WebCodecs-based audio tag for efficient and accurate embedding
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
