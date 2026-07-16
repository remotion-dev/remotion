import {expect, test} from 'bun:test';
import {beepOnFinishOption} from '../options/beep-on-finish';
import {disableWebSecurityOption} from '../options/disable-web-security';
import {disallowParallelEncodingOption} from '../options/disallow-parallel-encoding';
import {experimentalClientSideRenderingOption} from '../options/experimental-client-side-rendering';
import {forceNewStudioOption} from '../options/force-new-studio';
import {headlessOption} from '../options/headless';
import {ignoreCertificateErrorsOption} from '../options/ignore-certificate-errors';
import {imageSequenceOption} from '../options/image-sequence';
import {ipv4Option} from '../options/ipv4';
import {isProductionOption} from '../options/is-production';
import {keyboardShortcutsOption} from '../options/keyboard-shortcuts';
import {overwriteOption} from '../options/overwrite';
import {reproOption} from '../options/repro';

test('boolean options respect config if CLI flag is absent', () => {
	overwriteOption.setConfig(false);
	expect(
		overwriteOption.getValue({commandLine: {overwrite: null}}, true).value,
	).toEqual(false);
	expect(
		overwriteOption.getValue({commandLine: {overwrite: true}}, true).value,
	).toEqual(true);
	overwriteOption.setConfig(true);

	imageSequenceOption.setConfig(true);
	expect(
		imageSequenceOption.getValue({commandLine: {sequence: null}}).value,
	).toEqual(true);
	expect(
		imageSequenceOption.getValue({commandLine: {sequence: false}}).value,
	).toEqual(false);
	imageSequenceOption.setConfig(false);

	disableWebSecurityOption.setConfig(true);
	expect(
		disableWebSecurityOption.getValue({
			commandLine: {'disable-web-security': null},
		}).value,
	).toEqual(true);
	expect(
		disableWebSecurityOption.getValue({
			commandLine: {'disable-web-security': false},
		}).value,
	).toEqual(false);
	disableWebSecurityOption.setConfig(false);

	ignoreCertificateErrorsOption.setConfig(true);
	expect(
		ignoreCertificateErrorsOption.getValue({
			commandLine: {'ignore-certificate-errors': null},
		}).value,
	).toEqual(true);
	expect(
		ignoreCertificateErrorsOption.getValue({
			commandLine: {'ignore-certificate-errors': false},
		}).value,
	).toEqual(false);
	ignoreCertificateErrorsOption.setConfig(false);

	headlessOption.setConfig(false);
	expect(
		headlessOption.getValue({commandLine: {'disable-headless': null}}).value,
	).toEqual(false);
	expect(
		headlessOption.getValue({commandLine: {'disable-headless': false}}).value,
	).toEqual(true);
	headlessOption.setConfig(true);

	keyboardShortcutsOption.setConfig(false);
	expect(
		keyboardShortcutsOption.getValue({
			commandLine: {'disable-keyboard-shortcuts': null},
		}).value,
	).toEqual(false);
	expect(
		keyboardShortcutsOption.getValue({
			commandLine: {'disable-keyboard-shortcuts': false},
		}).value,
	).toEqual(true);
	keyboardShortcutsOption.setConfig(true);

	ipv4Option.setConfig(true);
	expect(ipv4Option.getValue({commandLine: {ipv4: null}}).value).toEqual(true);
	expect(ipv4Option.getValue({commandLine: {ipv4: false}}).value).toEqual(
		false,
	);
	ipv4Option.setConfig(false);

	beepOnFinishOption.setConfig(true);
	expect(
		beepOnFinishOption.getValue({commandLine: {'beep-on-finish': null}}).value,
	).toEqual(true);
	expect(
		beepOnFinishOption.getValue({commandLine: {'beep-on-finish': false}}).value,
	).toEqual(false);
	beepOnFinishOption.setConfig(false);

	disallowParallelEncodingOption.setConfig(true);
	expect(
		disallowParallelEncodingOption.getValue({
			commandLine: {'disallow-parallel-encoding': null},
		}).value,
	).toEqual(true);
	expect(
		disallowParallelEncodingOption.getValue({
			commandLine: {'disallow-parallel-encoding': false},
		}).value,
	).toEqual(false);
	disallowParallelEncodingOption.setConfig(false);

	reproOption.setConfig(true);
	expect(reproOption.getValue({commandLine: {repro: null}}).value).toEqual(
		true,
	);
	expect(reproOption.getValue({commandLine: {repro: false}}).value).toEqual(
		false,
	);
	reproOption.setConfig(false);

	isProductionOption.setConfig(false);
	expect(
		isProductionOption.getValue({commandLine: {'is-production': null}}).value,
	).toEqual(false);
	expect(
		isProductionOption.getValue({commandLine: {'is-production': true}}).value,
	).toEqual(true);
	isProductionOption.setConfig(null);

	forceNewStudioOption.setConfig(true);
	expect(
		forceNewStudioOption.getValue({commandLine: {'force-new': null}}).value,
	).toEqual(true);
	expect(
		forceNewStudioOption.getValue({commandLine: {'force-new': false}}).value,
	).toEqual(false);
	forceNewStudioOption.setConfig(false);

	experimentalClientSideRenderingOption.setConfig(false);
	expect(
		experimentalClientSideRenderingOption.getValue({commandLine: {}}).value,
	).toEqual(true);
	expect(
		experimentalClientSideRenderingOption.getValue({
			commandLine: {'enable-experimental-client-side-rendering': false},
		}).value,
	).toEqual(true);
});
