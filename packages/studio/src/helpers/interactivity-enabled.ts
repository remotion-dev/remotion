const interactivityEnabled = process.env.INTERACTIVITY_ENABLED as unknown;

export const studioInteractivityEnabled =
	interactivityEnabled === undefined || interactivityEnabled === null
		? true
		: interactivityEnabled !== false && interactivityEnabled !== 'false';
