import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/whisper-wasm/download-model">
					<strong>downloadModel()</strong>
					<div>Download a Whisper model in browser</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-wasm/transcribe">
					<strong>transcribe()</strong>
					<div>Transcribe an audio file in the WASM environemnt</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
