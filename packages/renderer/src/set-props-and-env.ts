import {Page} from 'puppeteer-core';
import {Internals} from 'remotion';

export const setPropsAndEnv = async ({
	inputProps,
	envVariables,
	page,
	serveUrl,
}: {
	inputProps: unknown;
	envVariables: Record<string, string> | undefined;
	page: Page;
	serveUrl: string;
}) => {
	if (inputProps || envVariables) {
		await page.goto(`${serveUrl}/index.html`);

		if (inputProps) {
			await page.evaluate(
				(key, input) => {
					window.localStorage.setItem(key, input);
				},
				Internals.INPUT_PROPS_KEY,
				JSON.stringify(inputProps)
			);
		}

		if (envVariables) {
			await page.evaluate(
				(key, input) => {
					window.localStorage.setItem(key, input);
				},
				Internals.ENV_VARIABLES_LOCAL_STORAGE_KEY,
				JSON.stringify(envVariables)
			);
		}
	}
};
