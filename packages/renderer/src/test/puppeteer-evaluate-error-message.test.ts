import {expect, test} from 'bun:test';
import type {Page} from '../browser/BrowserPage';
import {puppeteerEvaluateWithCatch} from '../puppeteer-evaluate';

test('keeps every line of a multi-line error message from the page', async () => {
	const description = [
		'Error: The props of the composition "my-comp" do not match its schema:',
		'  - title: Expected string, received number',
		'  - color.r: Expected number, received string',
		'    at resolveVideoConfigWithMetadata (http://localhost:3000/bundle.js:100:10)',
		'    at http://localhost:3000/bundle.js:200:20',
	].join('\n');

	const page = {
		mainFrame: () => ({
			executionContext: () => Promise.resolve({_contextId: 1}),
		}),
		_client: () => ({
			send: () =>
				Promise.resolve({
					value: {
						exceptionDetails: {exception: {description, className: 'Error'}},
						result: undefined,
					},
					size: 0,
				}),
		}),
		close: () => Promise.resolve(),
	} as unknown as Page;

	const error = await puppeteerEvaluateWithCatch({
		page,
		pageFunction: () => null,
		frame: null,
		args: [],
		timeoutInMilliseconds: 1000,
	}).catch((err: Error) => err);

	expect(error).toBeInstanceOf(Error);
	expect((error as Error).message).toBe(
		[
			'Error: The props of the composition "my-comp" do not match its schema:',
			'  - title: Expected string, received number',
			'  - color.r: Expected number, received string',
		].join('\n'),
	);
});
