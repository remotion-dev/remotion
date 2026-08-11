export type StudioEntryPointPaths = {
	fastRefreshRuntime: string | null;
	environmentSetup: string;
	sequenceStackTraces: string | null;
	userDefinedComponent: string;
	reactShim: string;
	studioRenderEntry: string;
};

export const getStudioEntryPoints = ({
	fastRefreshRuntime,
	environmentSetup,
	sequenceStackTraces,
	userDefinedComponent,
	reactShim,
	studioRenderEntry,
}: StudioEntryPointPaths): [string, ...string[]] =>
	[
		// Fast Refresh must come first because setup-environment imports ReactDOM.
		// If ReactDOM is imported before Fast Refresh, Fast Refresh does not work.
		fastRefreshRuntime,
		environmentSetup,
		sequenceStackTraces,
		userDefinedComponent,
		reactShim,
		studioRenderEntry,
	].filter(Boolean) as [string, ...string[]];
