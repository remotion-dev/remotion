import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/elevenlabs/elevenlabs-transcript-to-captions">
					<strong>{'elevenLabsTranscriptToCaptions()'}</strong>
					<div>
						Turn ElevenLabs Speech to Text output into an array of{' '}
						<code>Caption</code>
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
