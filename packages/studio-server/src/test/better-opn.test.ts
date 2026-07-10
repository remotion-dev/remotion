import {expect, test} from 'bun:test';
import {getChromiumBrowsersToTry} from '../better-opn';

test('matches running Chromium browsers by exact process name', () => {
	const processes = `
Google Chrome
Microsoft Edge
Brave Browser
`;

	expect(getChromiumBrowsersToTry(processes)).toEqual([
		'Google Chrome',
		'Microsoft Edge',
		'Brave Browser',
	]);
});

test('does not match browser names as substrings of other processes', () => {
	const processes = `
TrialArchivingService
FooArcBar
Vivaldi Updater
Google Chrome Helper
`;

	expect(getChromiumBrowsersToTry(processes)).toEqual([]);
});
