import {expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {parsedCli} from '../parsed-cli';

const {
	beepOnFinishOption,
	disableWebSecurityOption,
	disallowParallelEncodingOption,
	forceNewStudioOption,
	headlessOption,
	ignoreCertificateErrorsOption,
	imageSequenceOption,
	ipv4Option,
	isProductionOption,
	keyboardShortcutsOption,
	overwriteOption,
	reproOption,
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
	expect(parsedCli[reproOption.cliFlag]).toEqual(null);
	expect(parsedCli[isProductionOption.cliFlag]).toEqual(null);
	expect(parsedCli[forceNewStudioOption.cliFlag]).toEqual(null);
});
