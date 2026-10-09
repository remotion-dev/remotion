import {afterEach, expect, spyOn, test} from 'bun:test';
import {cycleBrowserTabs} from '../cycle-browser-tabs';
import type {BrowserReplacer} from '../replace-browser';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const makeReplacer = (bringToFront: () => Promise<void>) => {
	const page = {closed: false, url: () => 'http://localhost/', bringToFront};
	const replacer = {
		getBrowser: () => ({pages: () => Promise.resolve([page])}),
	} as unknown as BrowserReplacer;
	return {page, replacer};
};

const targetClosed = () =>
	new Error('Protocol error (Page.bringToFront): Target closed.');

const spies: {mockRestore: () => void}[] = [];

const spyOnErrorLog = () => {
	const spy = spyOn(console, 'error').mockImplementation(() => undefined);
	spies.push(spy);
	return spy;
};

afterEach(() => {
	for (const spy of spies.splice(0)) {
		spy.mockRestore();
	}
});

test('Should not log a target closed error after the cycler was stopped', async () => {
	const errorSpy = spyOnErrorLog();
	let stopCycling = () => {};
	const {replacer} = makeReplacer(() => {
		stopCycling();
		return Promise.reject(targetClosed());
	});
	({stopCycling} = cycleBrowserTabs({
		puppeteerInstance: replacer,
		concurrency: 2,
		logLevel: 'info',
		indent: false,
	}));
	await wait(350);
	expect(errorSpy).not.toHaveBeenCalled();
});

test('Should still log a target closed error if the page is closed but the cycler is not stopped', async () => {
	const errorSpy = spyOnErrorLog();
	const {page, replacer} = makeReplacer(() => {
		page.closed = true;
		return Promise.reject(targetClosed());
	});
	const {stopCycling} = cycleBrowserTabs({
		puppeteerInstance: replacer,
		concurrency: 2,
		logLevel: 'info',
		indent: false,
	});
	await wait(350);
	stopCycling();
	expect(errorSpy).toHaveBeenCalled();
});

test('Should still log a target closed error while the page is open and cycling', async () => {
	const errorSpy = spyOnErrorLog();
	const {replacer} = makeReplacer(() => Promise.reject(targetClosed()));
	const {stopCycling} = cycleBrowserTabs({
		puppeteerInstance: replacer,
		concurrency: 2,
		logLevel: 'info',
		indent: false,
	});
	await wait(350);
	stopCycling();
	expect(errorSpy).toHaveBeenCalled();
});

test('Should still log other errors after the cycler was stopped', async () => {
	const errorSpy = spyOnErrorLog();
	let stopCycling = () => {};
	const {replacer} = makeReplacer(() => {
		stopCycling();
		return Promise.reject(new Error('Something else went wrong'));
	});
	({stopCycling} = cycleBrowserTabs({
		puppeteerInstance: replacer,
		concurrency: 2,
		logLevel: 'info',
		indent: false,
	}));
	await wait(350);
	expect(errorSpy).toHaveBeenCalled();
});
