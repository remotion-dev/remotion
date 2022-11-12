import type {RenderJob} from './job';

export const jobQueue: RenderJob[] = [
	{
		compositionId: 'hi there',
		id: String(Math.random()),
		startedAt: Date.now(),
		type: 'still',
	},
];
