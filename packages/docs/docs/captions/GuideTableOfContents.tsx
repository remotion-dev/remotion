import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const GuideTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/captions/transcribing">
					<strong>{'Transcribing audio'}</strong>
					<div>Options for generating captions from audio</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
