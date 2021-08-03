import {checkNodeVersion} from './check-version';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {previewCommand} from './preview';
import {printHelp} from './print-help';
import {render} from './render';
import {upgrade} from './upgrade';

export const cli = async () => {
	const args = process.argv;
	const command = args[2];

	if (parsedCli.help) {
		printHelp();
		process.exit(0);
	}

	// To check node version and to warn if node version is <12.10.0
	checkNodeVersion();

	if (command === 'preview') {
		await previewCommand();
	} else if (command === 'render') {
		await render();
	} else if (command === 'still') {
		await render();
	} else if (command === 'upgrade') {
		await upgrade();
	} else {
		Log.error(`Command ${command} not found.`);
		printHelp();
		process.exit(1);
	}
};

export * from './render';
