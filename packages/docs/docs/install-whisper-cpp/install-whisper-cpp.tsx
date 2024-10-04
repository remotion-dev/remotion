import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/install-whisper-cpp/install-whisper-cpp">
					<strong>installWhisperCpp()</strong>
					<div>Install the whisper.cpp software</div>
				</TOCItem>
				<TOCItem link="/docs/install-whisper-cpp/download-whisper-model">
					<strong>downloadWhisperModel()</strong>
					<div>Download a Whisper model</div>
				</TOCItem>
				<TOCItem link="/docs/install-whisper-cpp/transcribe">
					<strong>transcribe()</strong>
					<div>Transcribe an audio file</div>
				</TOCItem>
				<TOCItem link="/docs/install-whisper-cpp/convert-to-captions">
					<strong>convertToCaptions()</strong>
					<div>Postprocessing for TikTok-style captions</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
