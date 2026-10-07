import type {StudioRuntimeConfig} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';

export const DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS = 300;

const defaultStudioRuntimeConfig: StudioRuntimeConfig = {
	askAIEnabled: false,
	bufferStateDelayInMilliseconds: null,
	defaultCodingAgent: null,
	defaultEditor: null,
	interactivityEnabled: true,
	keyboardShortcutsEnabled: true,
	maxTimelineTracks: null,
	publicLicenseKey: null,
	canvasTabsEnabled: true,
	configFileStudioSettings: null,
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

export const getStudioExperimentalTracksEnabled = () => {
	return getStudioRuntimeConfig().experimentalTracksEnabled ?? false;
};

export const getStudioKeyboardShortcutsEnabled = () => {
	return getStudioRuntimeConfig().keyboardShortcutsEnabled;
};

export const getStudioKeyboardShortcuts = () => {
	return getStudioRuntimeConfig().keyboardShortcuts ?? null;
};

export const getStudioMaxTimelineTracks = () => {
	return getStudioRuntimeConfig().maxTimelineTracks;
};

export const getStudioBufferStateDelayInMilliseconds = () => {
	return (
		getStudioRuntimeConfig().bufferStateDelayInMilliseconds ??
		DEFAULT_BUFFER_STATE_DELAY_IN_MILLISECONDS
	);
};

export const getStudioDefaultPremountInSeconds = () => {
	return (
		getStudioRuntimeConfig().defaultPremountInSeconds ??
		NoReactInternals.DEFAULT_PREMOUNT_IN_SECONDS
	);
};

export const getStudioShowPremounting = () => {
	return getStudioRuntimeConfig().showPremounting ?? true;
};
