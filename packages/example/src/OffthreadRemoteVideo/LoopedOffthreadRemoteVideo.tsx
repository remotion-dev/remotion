import {StudioInternals} from '@remotion/studio';
import {LoopedOffthreadRemoteVideoComponent} from './LoopedOffthreadRemoteVideo-video';
import {calculateMetadataFn} from './OffthreadRemoteVideo-calculate-metadata';

const fps = 30;

export const LoopedOffthreadRemoteVideo = StudioInternals.createComposition({
	component: LoopedOffthreadRemoteVideoComponent,
	id: 'LoopedOffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
