import type {RenderJob} from '../../preview-server/render-queue/job';
import {truthy} from '../../truthy';

let currentVideoId: string | null = null;
let unsavedProps = false;
let tabInactive = false;
let renderJobs: RenderJob[] = [];

export const setCurrentVideoId = (id: string | null) => {
	currentVideoId = id;
	updateTitle();
};

export const setUnsavedProps = (unsaved: boolean) => {
	window.remotion_unsavedProps = unsaved;

	unsavedProps = unsaved;
};

export const setRenderJobs = (jobs: RenderJob[]) => {
	renderJobs = jobs;
	updateTitle();
};

document.addEventListener('visibilitychange', () => {
	tabInactive = document.visibilityState === 'hidden';
	updateTitle();
});

const productName = 'Remotion Studio';
const suffix = `- ${productName}`;

const updateTitle = () => {
	if (!currentVideoId) {
		document.title = productName;
		return;
	}

	const currentCompTitle = `${currentVideoId} / ${window.remotion_projectName}`;

	document.title = [
		getProgressInBrackets(currentVideoId, renderJobs),
		unsavedProps && tabInactive ? '✏️' : null,
		`${currentCompTitle} ${suffix}`,
	]
		.filter(truthy)
		.join(' ');
};

const getProgressInBrackets = (
	selectedCompositionId: string,
	jobs: RenderJob[],
): string | null => {
	const currentRender = jobs.find((job) => job.status === 'running');
	if (!currentRender) {
		return null;
	}

	if (currentRender.status !== 'running') {
		throw new Error('expected running job');
	}

	const progInPercent = Math.ceil(currentRender.progress.value * 100);
	const progressInBrackets =
		currentRender.compositionId === selectedCompositionId
			? `[${progInPercent}%]`
			: `[${progInPercent}% ${currentRender.compositionId}]`;
	return progressInBrackets;
};

document.addEventListener('visibilitychange', () => {
	tabInactive = document.visibilityState === 'hidden';
	updateTitle();
});
