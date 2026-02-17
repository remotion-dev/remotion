import type {AggregateRenderProgress} from '@remotion/studio-server';

export const initialAggregateRenderProgress = (): AggregateRenderProgress => ({
	rendering: null,
	browser: {
		progress: 0,
		alreadyAvailable: true,
		doneIn: null,
	},
	downloads: [],
	stitching: null,
	bundling: null,
	copyingState: {
		bytes: 0,
		doneIn: null,
	},
	artifactState: {
		received: [],
	},
	logs: [],
});
