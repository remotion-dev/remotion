import {downloadBrowser} from '../browser/BrowserFetcher';

downloadBrowser()
	.then((c) => {
		console.log(c);
	})
	.catch((err) => {
		console.log(err.stack);
	});
