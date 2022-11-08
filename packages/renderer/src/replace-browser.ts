import type {Browser} from './browser/Browser';

export const handleBrowserCrash = (instance: Browser) => {
	let _instance = instance;
	const waiters: {
		resolve: (br: Browser) => void;
		reject: (err: Error) => void;
	}[] = [];
	let replacing = true;

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
				const browser = await make();
				replacing = false;
				_instance = browser;
				waiters.forEach((w) => w.resolve(browser));
				return browser;
			} catch (err) {
				waiters.forEach((w) => w.reject(err as Error));
				throw err;
			}
		},
	};
};
