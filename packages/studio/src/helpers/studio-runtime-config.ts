import type {StudioRuntimeConfig} from '@remotion/studio-shared';
import {DEFAULT_TIMELINE_TRACKS} from '@remotion/studio-shared';

export const DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS = 300;

const defaultStudioRuntimeConfig: StudioRuntimeConfig = {
	askAIEnabled: false,
	bufferStateDelayInMilliseconds: null,
	interactivityEnabled: true,
	keyboardShortcutsEnabled: true,
	maxTimelineTracks: null,
};

const getStudioRuntimeConfig = (): StudioRuntimeConfig => {
	if (typeof window === 'undefined') {
		return defaultStudioRuntimeConfig;
	}

	return window.remotion_studioConfig ?? defaultStudioRuntimeConfig;
};

export const getStudioAskAIEnabled = () => {
	return getStudioRuntimeConfig().askAIEnabled;
};

export const getStudioInteractivityEnabled = () => {
	return getStudioRuntimeConfig().interactivityEnabled;
};

export const getStudioKeyboardShortcutsEnabled = () => {
	return getStudioRuntimeConfig().keyboardShortcutsEnabled;
};

export const getStudioMaxTimelineTracks = () => {
	return getStudioRuntimeConfig().maxTimelineTracks ?? DEFAULT_TIMELINE_TRACKS;
};

export const getStudioBufferStateDelayInMilliseconds = () => {
	return (
		getStudioRuntimeConfig().bufferStateDelayInMilliseconds ??
		DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS
	);
};
