import type {Codec, StitchingState} from '@remotion/renderer';
import type {BundlingState, CopyingState} from './progress-bar';
import type {RenderStep} from './step';

export type DownloadProgress = {
	name: string;
	id: number;
	progress: number | null;
	totalBytes: number | null;
	downloaded: number;
};

export type RenderingProgressInput = {
	frames: number;
	totalFrames: number;
	steps: RenderStep[];
	concurrency: number;
	doneIn: number | null;
};

export type StitchingProgressInput = {
	frames: number;
	totalFrames: number;
	doneIn: number | null;
	stage: StitchingState;
	codec: Codec;
};

export type AggregateRenderProgress = {
	rendering: RenderingProgressInput | null;
	stitching: StitchingProgressInput | null;
	downloads: DownloadProgress[];
	bundling: BundlingState;
	copyingState: CopyingState;
};

export const initialAggregateRenderProgress = (): AggregateRenderProgress => ({
	rendering: null,
	downloads: [],
	stitching: null,
	bundling: {
		progress: 0,
		doneIn: null,
	},
	copyingState: {
		bytes: 0,
		doneIn: null,
	},
});
