import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/openai-whisper/openai-whisper-api-to-captions">
					<strong>{'openAiWhisperApiToCaptions()'}</strong>
					<div>
						Turn OpenAI Whisper API transcriptions into an array of{' '}
						<code>Caption</code>
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
