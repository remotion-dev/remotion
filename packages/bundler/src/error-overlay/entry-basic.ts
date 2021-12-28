import {startReportingRuntimeErrors} from './react-overlay';

startReportingRuntimeErrors({
	onError() {
		if (module.hot) {
			console.log('error occurred');
			module.hot.addStatusHandler((status) => {
				if (status === 'apply') {
					console.log('apply');
					// window.location.reload();
					// dismissRuntimeErrors();
				}
			});
		}
	},
});
