#! /usr/bin/env node

import xns from 'xns';
import {checkNodeVersion} from './check-version';
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
		console.log(`Command ${command} not found.`);
		console.log('Available commands:');
		console.log('  preview');
		console.log('  render');
		console.log('  upgrade');
		process.exit(1);
	}
});

export * from './render';
