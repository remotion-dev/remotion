import type {HeadlessBrowser} from './browser/Browser';

export type BrowserReplacer = {
	getBrowser: () => HeadlessBrowser;
	replaceBrowser: (
		make: () => Promise<HeadlessBrowser>,
		makeNewPages: () => Promise<void>
	) => Promise<HeadlessBrowser>;
};

export const handleBrowserCrash = (
	instance: HeadlessBrowser
): BrowserReplacer => {
	let _instance = instance;
	const waiters: {
		resolve: (br: HeadlessBrowser) => void;
		reject: (err: Error) => void;
	}[] = [];
	let replacing = false;

	return {
		getBrowser: () => _instance,
		replaceBrowser: async (make, makeNewPages): Promise<HeadlessBrowser> => {
			if (replacing) {
				const waiter = new Promise<HeadlessBrowser>((resolve, reject) => {
					waiters.push({
						resolve,
						reject,
					});
				});
				return waiter;
			}

			try {
				replacing = true;
				await _instance
					.close(true)
					.then(() => {
						console.log('Killed previous browser and making new one');
					})
					.catch(() => {
						// Ignore as browser crashed
					});
				const browser = await make();
				_instance = browser;
				await makeNewPages();
				waiters.forEach((w) => w.resolve(browser));
				console.log('Made new browser');
				return browser;
			} catch (err) {
				waiters.forEach((w) => w.reject(err as Error));
				throw err;
			} finally {
				replacing = false;
			}
		},
	};
};
