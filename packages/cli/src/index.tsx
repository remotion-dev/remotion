#! /usr/bin/env node

import xns from 'xns';
import {checkNodeVersion} from './check-version';
import {Log} from './log';
import {previewCommand} from './preview';
import {render} from './render';
import {upgrade} from './upgrade';

export const cli = xns(async () => {
	const args = process.argv;
	const command = args[2];
	//To check node version and to warn if node version is <12.10.0
	checkNodeVersion();

	if (command === 'preview') {
		await previewCommand();
	} else if (command === 'render') {
		await render();
	} else if (command === 'upgrade') {
		await upgrade();
	} else {
		Log.Error(`Command ${command} not found.`);
		Log.Info('Available commands:');
		Log.Info('  preview');
		Log.Info('  render');
		Log.Info('  upgrade');
		process.exit(1);
	}
});

export * from './render';
