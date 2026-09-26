import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/whisper-webgpu/can-use-whisper-webgpu">
				<strong>canUseWhisperWebGpu()</strong>
				<div>Check whether transcription is possible</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/get-available-models">
				<strong>getAvailableModels()</strong>
				<div>List models and their download sizes</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/clear-stale-models">
				<strong>clearStaleModels()</strong>
				<div>Remove models discontinued by newer versions</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/is-whisper-model-cached">
				<strong>isWhisperModelCached()</strong>
				<div>Check whether a model is downloaded</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/download-whisper-model">
				<strong>downloadWhisperModel()</strong>
				<div>Download a model</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/load-whisper-model">
				<strong>loadWhisperModel()</strong>
				<div>Initialize a downloaded model</div>
      </TOCItem>
      <TOCItem link="/docs/whisper-webgpu/dispose-whisper-model">
				<strong>disposeWhisperModel()</strong>
				<div>Release model memory</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/remove-whisper-model">
				<strong>removeWhisperModel()</strong>
				<div>Remove a model from the persistent cache</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/transcribe">
				<strong>transcribe()</strong>
				<div>Transcribe a waveform with word-level timestamps</div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/to-captions">
				<strong>toCaptions()</strong>
				<div>Convert a transcription to <code>@remotion/captions</code></div>
			</TOCItem>
			<TOCItem link="/docs/whisper-webgpu/resample-to-16khz">
				<strong>resampleTo16Khz()</strong>
				<div>Decode and resample browser audio</div>
			</TOCItem>
		</Grid>
	);
};
