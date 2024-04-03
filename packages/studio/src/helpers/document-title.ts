import type {RenderJob} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';

let currentItemName: string | null = null;
let unsavedProps = false;
let tabInactive = false;
let renderJobs: RenderJob[] = [];

export const setCurrentCanvasContentId = (id: string | null) => {
	if (!id) {
		currentItemName = id;
		updateTitle();
		return;
	}

	const idWithoutFolder = id.split('/').pop() as string;
	currentItemName = idWithoutFolder;
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
	if (!currentItemName) {
		document.title = productName;
		return;
	}

	const currentCompTitle = `${currentItemName} / ${window.remotion_projectName}`;

	document.title = [
		getProgressInBrackets(currentItemName, renderJobs),
		unsavedProps && tabInactive ? '✏️' : null,
		`${currentCompTitle} ${suffix}`,
	]
		.filter(NoReactInternals.truthy)
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
