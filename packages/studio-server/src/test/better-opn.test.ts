import {expect, test} from 'bun:test';
import {
	getChromiumBrowsersToTry,
	getFocusBrowserTabAppleScript,
} from '../better-opn';

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

test('focuses an exact existing tab without reloading or opening one', () => {
	const appleScript = getFocusBrowserTabAppleScript('Google Chrome');

	expect(appleScript).toContain('set targetURL to item 1 of argv');
	expect(appleScript).toContain("if (theTab's URL as string) is lookupUrl");
	expect(appleScript).toContain(
		"set targetWindow's active tab index to targetTabIndex",
	);
	expect(appleScript).toContain('activate');
	expect(appleScript).not.toContain('reload');
	expect(appleScript).not.toContain('make new tab');
	expect(appleScript).not.toContain('make new window');
});
