import React from 'react';
import {staticFile} from 'remotion';
import {AudioWaveformProgress} from './waveform-progress.element';

export const AudioWaveformProgressComposition: React.FC = () => {
	return (
		<AudioWaveformProgress
			audioSrc={staticFile(
				'elements/audio-oscilloscope/remotion-made-this-picture-move.mp3',
			)}
			durationInFrames={271}
			name="Voice Note"
			style={{position: 'absolute'}}
			premountFor={30}
		/>
	);
};
