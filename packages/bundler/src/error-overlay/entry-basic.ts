import {startReportingRuntimeErrors} from './react-overlay';
import {mountRemotionOverlay} from './remotion-overlay';

startReportingRuntimeErrors({
	onError() {
		if (module.hot) {
			module.hot.addStatusHandler((status) => {
				if (status === 'apply') {
					window.location.reload();
				}
			});
		}
	},
});
mountRemotionOverlay();
