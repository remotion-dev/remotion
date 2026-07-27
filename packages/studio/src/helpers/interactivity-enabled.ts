import {getStudioInteractivityEnabled} from './studio-runtime-config';

export const isStudioInteractivityEnabled = () => {
	return (
		getStudioInteractivityEnabled() &&
		(typeof window === 'undefined' || !window.remotion_isReadOnlyStudio)
	);
};

export const isStudioSelectionEnabled = getStudioInteractivityEnabled;
