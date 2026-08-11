import type {ComponentType} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import type {
	ClientStillRenderJob,
	ClientVideoRenderJob,
} from './client-side-render-types';

export type CompositionRef = {
	component: ComponentType<Record<string, unknown>>;
	calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> | null;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	defaultProps: Record<string, unknown>;
};

const compositionRegistry = new Map<string, CompositionRef>();

export const registerCompositionForJob = (
	jobId: string,
	compositionRef: CompositionRef,
): void => {
	compositionRegistry.set(jobId, compositionRef);
};

export const getCompositionForJob = (
	jobId: string,
): CompositionRef | undefined => {
	return compositionRegistry.get(jobId);
};

export const cleanupCompositionForJob = (jobId: string): void => {
	compositionRegistry.delete(jobId);
};

export const generateJobId = (): string => {
	return `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const clientJobAbortControllers = new Map<string, AbortController>();

export const getAbortController = (jobId: string): AbortController => {
	let controller = clientJobAbortControllers.get(jobId);
	if (!controller) {
		controller = new AbortController();
		clientJobAbortControllers.set(jobId, controller);
	}

	return controller;
};

export const deleteAbortController = (jobId: string): void => {
	clientJobAbortControllers.delete(jobId);
};

export const cancelAbortController = (jobId: string): void => {
	const controller = clientJobAbortControllers.get(jobId);
	if (controller) {
		controller.abort();
	}
};

export type AddClientStillJobParams = Omit<
	ClientStillRenderJob,
	'id' | 'startedAt' | 'status'
>;

export type AddClientVideoJobParams = Omit<
	ClientVideoRenderJob,
	'id' | 'startedAt' | 'status'
>;
