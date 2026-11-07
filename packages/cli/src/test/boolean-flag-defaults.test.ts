import {expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {parsedCli} from '../parsed-cli';

const {
	beepOnFinishOption,
	askAIOption,
	disableGitSourceOption,
	disableWebSecurityOption,
	disallowParallelEncodingOption,
	enableCancellationOption,
	enableCrossSiteIsolationOption,
	enableLambdaInsights,
	forceNewStudioOption,
	forSeamlessAacConcatenationOption,
	headlessOption,
	ignoreCertificateErrorsOption,
	imageSequenceOption,
	ipv4Option,
	isProductionOption,
	keyboardShortcutsOption,
	overwriteOption,
	preferLosslessOption,
	reproOption,
	rspackOption,
	throwIfSiteExistsOption,
} = BrowserSafeApis.options;

test('config-backed boolean flags default to null when absent', () => {
	expect(parsedCli[overwriteOption.cliFlag]).toEqual(null);
	expect(parsedCli[imageSequenceOption.cliFlag]).toEqual(null);
	expect(parsedCli[disableWebSecurityOption.cliFlag]).toEqual(null);
	expect(parsedCli[ignoreCertificateErrorsOption.cliFlag]).toEqual(null);
	expect(parsedCli[headlessOption.cliFlag]).toEqual(null);
	expect(parsedCli[keyboardShortcutsOption.cliFlag]).toEqual(null);
	expect(parsedCli[ipv4Option.cliFlag]).toEqual(null);
	expect(parsedCli[beepOnFinishOption.cliFlag]).toEqual(null);
	expect(parsedCli[disallowParallelEncodingOption.cliFlag]).toEqual(null);
	expect(parsedCli[enableCancellationOption.cliFlag]).toEqual(null);
	expect(parsedCli[reproOption.cliFlag]).toEqual(null);
	expect(parsedCli[isProductionOption.cliFlag]).toEqual(null);
	expect(parsedCli[forceNewStudioOption.cliFlag]).toEqual(null);
	expect(parsedCli[rspackOption.cliFlag]).toEqual(null);
	expect(parsedCli[enableCrossSiteIsolationOption.cliFlag]).toEqual(null);
	expect(parsedCli[enableLambdaInsights.cliFlag]).toEqual(null);
	expect(parsedCli[askAIOption.cliFlag]).toEqual(null);
});

test('boolean flags without a null default are false when absent', () => {
	expect(parsedCli[disableGitSourceOption.cliFlag]).toBe(false);
	expect(parsedCli[forSeamlessAacConcatenationOption.cliFlag]).toBe(false);
	expect(parsedCli[throwIfSiteExistsOption.cliFlag]).toBe(false);
	expect(parsedCli[preferLosslessOption.cliFlag]).toBe(false);
});

test('CLI argument types only allow declared flag names', () => {
	// @ts-expect-error A string index signature would bypass the flag and default type checks.
	expect(parsedCli['not-a-remotion-flag']).toBeUndefined();
});
