import {ensureBrowser} from '@remotion/renderer';

await ensureBrowser({
	onBrowserDownload: () => {
		return {
			version: null,
			onProgress: ({percent}) => {
				console.log(JSON.stringify({type: 'browser-progress', percent}));
			},
		};
	},
});
