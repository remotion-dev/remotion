import React from 'react';
import {Grid} from './Grid';
import {TOCItem} from './TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/audio-buffer-to-data-url">
					<strong>audioBufferToDataUrl()</strong>
					<div>Serialize an audio buffer</div>
				</TOCItem>
				<TOCItem link="/docs/get-audio-data">
					<strong>getAudioData()</strong>
					<div>Get metadata of an audio source</div>
				</TOCItem>
				<TOCItem link="/docs/get-audio-duration-in-seconds">
					<strong>getAudioDurationInSeconds()</strong>
					<div>Get the duration of an audio source</div>
				</TOCItem>
				<TOCItem link="/docs/get-video-metadata">
					<strong>getVideoMetadata()</strong>
					<div>Get metadata of a video source</div>
				</TOCItem>
				<TOCItem link="/docs/get-waveform-portion">
					<strong>getWaveformPortion()</strong>
					<div>Trims audio data into a waveform</div>
				</TOCItem>
				<TOCItem link="/docs/use-audio-data">
					<strong>useAudioData()</strong>
					<div>
						<code>getAudioData()</code> as a hook
					</div>
				</TOCItem>
				<TOCItem link="/docs/use-windowed-audio-data">
					<strong>useWindowedAudioData()</strong>
					<div>
						Optimized for fetching only current data, works only with{' '}
						<code>.wav</code>
					</div>
				</TOCItem>
				<TOCItem link="/docs/visualize-audio">
					<strong>visualizeAudio()</strong>
					<div>Process a music waveform for visualization</div>
				</TOCItem>
				<TOCItem link="/docs/media-utils/visualize-audio-waveform">
					<strong>visualizeAudioWaveform()</strong>
					<div>Process a voice waveform for visualization</div>
				</TOCItem>
				<TOCItem link="/docs/media-utils/create-smooth-svg-path">
					<strong>createSmoothSvgPath()</strong>
					<div>Turn waveform points into a smooth SVG path</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
