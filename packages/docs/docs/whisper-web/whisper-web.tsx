import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/whisper-web/can-use-whisper-web">
					<strong>canUseWhisperWeb()</strong>
					<div>Check if the browser supports this Whisper package</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-web/get-available-models">
					<strong>getAvailableModels()</strong>
					<div>Get a list of all available Whisper models with their download sizes</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-web/download-whisper-model">
					<strong>downloadWhisperModel()</strong>
					<div>Download a Whisper model in browser</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-web/resample-to-16khz">
					<strong>resampleTo16khz()</strong>
					<div>
						Prepare an audio file for transcription by resampling it to 16kHz
					</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-web/transcribe">
					<strong>transcribe()</strong>
					<div>Transcribe an audio file in the WASM environemnt</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-web/get-loaded-models">
					<strong>getLoadedModels()</strong>
					<div>Get a list of Whisper models that are already downloaded</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-web/to-captions">
					<strong>toCaptions()</strong>
					<div>
						Convert the output from <code>transcribe()</code> to an array of{' '}
						<code>Caption</code> objects.
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
