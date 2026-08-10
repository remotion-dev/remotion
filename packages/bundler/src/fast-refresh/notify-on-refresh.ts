import {REACT_REFRESH_FINISHED_EVENT} from '@remotion/studio-shared';

type ReactRefreshRuntime = {
	performReactRefresh: () => unknown;
	__remotionReactRefreshWrapped: boolean | null;
};

const RefreshRuntime = require('react-refresh/runtime') as ReactRefreshRuntime;
RefreshRuntime.__remotionReactRefreshWrapped ??= null;

if (RefreshRuntime.__remotionReactRefreshWrapped === null) {
	const originalPerformReactRefresh = RefreshRuntime.performReactRefresh;
	RefreshRuntime.__remotionReactRefreshWrapped = true;
	RefreshRuntime.performReactRefresh = () => {
		// The refresh integration calls this after applying the update. Emitting
		// here gives Studio a boundary after React refreshed its roots.
		const result = originalPerformReactRefresh();
		if (result !== null) {
			window.dispatchEvent(new Event(REACT_REFRESH_FINISHED_EVENT));
		}

		return result;
	};
}
