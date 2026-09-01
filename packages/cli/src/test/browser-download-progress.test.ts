import {expect, test} from 'bun:test';
import type {BrowserDownloadState} from '@remotion/studio-shared';
import {defaultBrowserDownloadProgress} from '../browser-download-bar';
import {getGuiProgressSubtitle} from '../progress-bar';
import {initialAggregateRenderProgress} from '../progress-types';

test('forwards download progress to the UI callback when updates do not overwrite', () => {
	const states: BrowserDownloadState[] = [];

	// 'verbose' forces the non-overwriting logger branch, which previously
	// never called `onProgress` (https://github.com/remotion-dev/remotion/issues/10228)
	const {onProgress} = defaultBrowserDownloadProgress({
		indent: false,
		logLevel: 'verbose',
		quiet: true,
		onProgress: (state) => states.push(state),
	})({chromeMode: 'headless-shell'});

	onProgress({
		alreadyAvailable: false,
		percent: 0.5,
		downloadedBytes: 100_000_000,
		totalSizeInBytes: 200_000_000,
	});

	expect(states).toEqual([
		{alreadyAvailable: false, progress: 0.5, doneIn: null},
	]);

	onProgress({
		alreadyAvailable: false,
		percent: 1,
		downloadedBytes: 200_000_000,
		totalSizeInBytes: 200_000_000,
	});

	expect(states.length).toBe(2);
	expect(states[1]?.progress).toBe(1);
	expect(typeof states[1]?.doneIn).toBe('number');
});

test('GUI subtitle reflects the browser download', () => {
	const progress = initialAggregateRenderProgress();

	progress.browser = {progress: 0.42, doneIn: null, alreadyAvailable: false};
	expect(getGuiProgressSubtitle(progress)).toBe('Downloading browser 42%');

	progress.browser = {
		progress: 0.42,
		doneIn: null,
		alreadyAvailable: false,
		error: true,
	};
	expect(getGuiProgressSubtitle(progress)).toBe('Failed to download browser');

	progress.browser = {progress: 1, doneIn: 5000, alreadyAvailable: false};
	expect(getGuiProgressSubtitle(progress)).toBe('Bundling 0%');
});
