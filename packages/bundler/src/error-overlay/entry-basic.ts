import {dismissErrors, startReportingRuntimeErrors} from './react-overlay';
import {mountRemotionOverlay} from './remotion-overlay';
import {setErrorsRef} from './remotion-overlay/Overlay';

startReportingRuntimeErrors({
	onError() {
		if (module.hot) {
			module.hot.addStatusHandler((status) => {
				if (status === 'apply') {
					dismissErrors();
					setErrorsRef.current?.setErrors([]);
				}
			});
		}
	},
});
mountRemotionOverlay();
