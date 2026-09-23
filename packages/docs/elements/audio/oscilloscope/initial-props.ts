import type {ElementAsset} from '@remotion/studio-protocol';
import type {ComponentProps} from 'react';
import type {AudioOscilloscope} from './audio-oscilloscope';

export const audioOscilloscopeAudio = {
	path: 'elements/audio-oscilloscope/remotion-made-this-picture-move.mp3',
	type: 'url',
	url: 'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
} as const satisfies ElementAsset;

export const audioOscilloscopeInitialProps = {
	audioSrc: audioOscilloscopeAudio.url,
} satisfies ComponentProps<typeof AudioOscilloscope>;
