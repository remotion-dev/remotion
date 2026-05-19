import {StudioInternals} from '@remotion/studio';
import {calculateMetadataFn} from './MultiChannelAudio-calculate-metadata';
import {MultiChannelAudioComponent} from './MultiChannelAudio-component';

const fps = 30;

export const MultiChannelAudio = StudioInternals.createComposition({
	component: MultiChannelAudioComponent,
	id: 'MultiChannelAudio',
	calculateMetadata: calculateMetadataFn,
	fps,
	width: 100,
	height: 100,
});
