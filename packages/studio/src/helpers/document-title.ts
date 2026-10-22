import {NoReactInternals} from 'remotion/no-react';
import type {AnyRenderJob} from '../components/RenderQueue/context';
import {isClientRenderJob} from '../components/RenderQueue/context';
import type {ModalState} from '../state/modals';
import {getNavigationWindow} from './url-state';

let currentItemName: string | null = null;
let currentModal: ModalState | null = null;
let renderJobs: AnyRenderJob[] = [];

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

export const setRenderJobs = (jobs: AnyRenderJob[]) => {
	renderJobs = jobs;
	updateTitle();
};

export const setCurrentModal = (modal: ModalState | null) => {
	currentModal = modal;
	updateTitle();
};

const productName = 'Remotion Studio';
const suffix = `- ${productName}`;

const updateTitle = () => {
	if (currentModal?.type === 'element-install') {
		getNavigationWindow().document.title = `📦 Install ${currentModal.request.element.displayName} - ${productName}`;
		return;
	}

	if (!currentItemName) {
		getNavigationWindow().document.title = productName;
		return;
	}

	const currentCompTitle = `${currentItemName} / ${window.remotion_projectName}`;

	getNavigationWindow().document.title = [
		getProgressInBrackets(currentItemName, renderJobs),
		`${currentCompTitle} ${suffix}`,
	]
		.filter(NoReactInternals.truthy)
		.join(' ');
};

const getProgressInBrackets = (
	selectedCompositionId: string,
	jobs: AnyRenderJob[],
): string | null => {
	const currentRender = jobs.find((job) => job.status === 'running');
	if (!currentRender) {
		return null;
	}

	if (currentRender.status !== 'running') {
		throw new Error('expected running job');
	}

	let progInPercent: number;
	if (isClientRenderJob(currentRender)) {
		const {encodedFrames, totalFrames} = currentRender.progress;
		progInPercent =
			totalFrames > 0 ? Math.ceil((encodedFrames / totalFrames) * 100) : 0;
	} else {
		progInPercent = Math.ceil(currentRender.progress.value * 100);
	}

	const progressInBrackets =
		currentRender.compositionId === selectedCompositionId
			? `[${progInPercent}%]`
			: `[${progInPercent}% ${currentRender.compositionId}]`;
	return progressInBrackets;
};
