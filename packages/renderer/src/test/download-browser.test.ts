import {downloadBrowser} from '../browser/create-browser-fetcher';

downloadBrowser('chrome')
	.then((c) => {
		console.log(c);
	})
	.catch((err) => {
		console.log(err);
	});
