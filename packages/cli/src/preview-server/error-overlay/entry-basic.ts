import {didUnmountReactApp, startReportingRuntimeErrors} from './react-overlay';
import {mountRemotionOverlay} from './remotion-overlay';
import {setErrorsRef} from './remotion-overlay/Overlay';

startReportingRuntimeErrors(() => {
	if (module.hot) {
		module.hot.addStatusHandler((status) => {
			if (status === 'apply') {
				if (didUnmountReactApp()) {
					return window.location.reload();
				}

				setErrorsRef.current?.setErrors({
					type: 'clear',
				});
			}
		});
	}
});
mountRemotionOverlay();
