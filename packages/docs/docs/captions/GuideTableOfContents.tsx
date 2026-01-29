import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const GuideTableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/captions/importing">
					<strong>{'Importing from .srt'}</strong>
					<div>Import existing .srt subtitle files</div>
				</TOCItem>
				<TOCItem link="/docs/captions/transcribing">
					<strong>{'Transcribing audio'}</strong>
					<div>Options for generating captions from audio</div>
				</TOCItem>
				<TOCItem link="/docs/captions/displaying">
					<strong>{'Displaying captions'}</strong>
					<div>Render captions in your Remotion video</div>
				</TOCItem>
				<TOCItem link="/docs/captions/exporting">
					<strong>{'Exporting subtitles'}</strong>
					<div>Export subtitles as burned-in or .srt files</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
