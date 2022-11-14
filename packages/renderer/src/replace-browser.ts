import type {Browser} from './browser/Browser';

export type BrowserReplacer = {
	getBrowser: () => Browser;
	replaceBrowser: (make: () => Promise<Browser>) => Promise<Browser>;
};

export const handleBrowserCrash = (instance: Browser): BrowserReplacer => {
	let _instance = instance;
	const waiters: {
		resolve: (br: Browser) => void;
		reject: (err: Error) => void;
	}[] = [];
	let replacing = false;

	return {
		getBrowser: () => _instance,
		replaceBrowser: async (make: () => Promise<Browser>): Promise<Browser> => {
			if (replacing) {
				const waiter = new Promise<Browser>((resolve, reject) => {
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
