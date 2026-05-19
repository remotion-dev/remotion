import {StudioInternals} from '@remotion/studio';
import {calculateMetadataFn} from './OffthreadRemoteVideo-calculate-metadata';
import {OffthreadRemoteVideoComponent} from './OffthreadRemoteVideo-component';

const fps = 30;

export const OffthreadRemoteVideo = StudioInternals.createComposition({
	component: OffthreadRemoteVideoComponent,
	id: 'OffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
