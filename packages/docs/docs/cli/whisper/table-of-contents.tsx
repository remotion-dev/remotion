import React from 'react';
import {Grid} from '../../../components/TableOfContents/Grid';
import {TOCItem} from '../../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/cli/whisper/transcribe">
				<strong>whisper transcribe</strong>
				<div>
					Generate a <code>Caption[]</code> JSON file from audio or video
				</div>
			</TOCItem>
			<TOCItem link="/docs/cli/whisper/install">
				<strong>whisper install</strong>
				<div>Download a model to the local cache</div>
			</TOCItem>
			<TOCItem link="/docs/cli/whisper/rm">
				<strong>whisper rm</strong>
				<div>Remove a cached model</div>
			</TOCItem>
			<TOCItem link="/docs/cli/whisper/rmall">
				<strong>whisper rmall</strong>
				<div>Clear the local Whisper model cache</div>
			</TOCItem>
			<TOCItem link="/docs/cli/whisper/ls">
				<strong>whisper ls</strong>
				<div>List available models and show which are cached</div>
			</TOCItem>
		</Grid>
	);
};
