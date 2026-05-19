import {StudioInternals} from '@remotion/studio';
import {calculateMetadataFn} from './OffthreadRemoteSeries-calculate-metadata';
import {OffthreadRemoteSeriesComponent} from './OffthreadRemoteSeries-component';

const fps = 30;

export const OffthreadRemoteSeries = StudioInternals.createComposition({
	component: OffthreadRemoteSeriesComponent,
	id: 'OffthreadRemoteSeries',
	calculateMetadata: calculateMetadataFn,
	defaultProps: {
		durations: null,
	},
	fps,
});
