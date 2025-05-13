import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/whisper-webgpu/can-use-whisper-webgpu">
					<strong>canUseWhisperWebGpu()</strong>
					<div>Check if the browser supports Whisper WASM</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-webgpu/download-whisper-model">
					<strong>downloadWhisperModel()</strong>
					<div>Download a Whisper model in browser</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-webgpu/resample-to-16khz">
					<strong>resampleTo16khz()</strong>
					<div>
						Prepare an audio file for transcription by resampling it to 16kHz
					</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-webgpu/transcribe">
					<strong>transcribe()</strong>
					<div>Transcribe an audio file in the WASM environemnt</div>
				</TOCItem>
				<TOCItem link="/docs/whisper-webgpu/get-loaded-models">
					<strong>getLoadedModels()</strong>
					<div>Get a list of Whisper models that are already downloaded</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
