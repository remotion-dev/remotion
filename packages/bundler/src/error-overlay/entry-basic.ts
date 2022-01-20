import {
	dismissErrors,
	shouldReload,
	startReportingRuntimeErrors,
} from './react-overlay';
import {mountRemotionOverlay} from './remotion-overlay';
import {setErrorsRef} from './remotion-overlay/Overlay';

console.log(__filename);

startReportingRuntimeErrors({
	onError() {
		if (module.hot) {
			module.hot.addStatusHandler((status) => {
				if (status === 'apply') {
					if (shouldReload()) {
						return window.location.reload();
					}

					dismissErrors();
					setErrorsRef.current?.setErrors({
						type: 'clear',
					});
				}
			});
		}
	},
	// TODO: Adapt to dynamic base in Lambda
	filename: '/bundle.js',
});
mountRemotionOverlay();
