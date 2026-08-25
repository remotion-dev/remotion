import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/whisper-webgpu/can-use-whisper-webgpu">
				<strong>canUseWhisperWebGpu()</strong>
				<div>Check which inference backend is available</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/get-available-models">
				<strong>getAvailableModels()</strong>
				<div>List timestamped models and their download sizes</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/load-whisper-model">
				<strong>loadWhisperModel()</strong>
				<div>Download and initialize a model</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/transcribe">
				<strong>transcribe()</strong>
				<div>Transcribe a waveform with word-level timestamps</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/to-captions">
				<strong>toCaptions()</strong>
				<div>Convert a transcription to Remotion captions</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/resample-to-16khz">
				<strong>resampleTo16Khz()</strong>
				<div>Decode and resample browser audio</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/dispose-whisper-model">
				<strong>disposeWhisperModel()</strong>
				<div>Release model memory</div>
			</TOCItem>
		</Grid>
	);
};
