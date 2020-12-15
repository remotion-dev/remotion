import xns from 'xns';
import {previewCommand} from './preview';

export const cli = xns(async () => {
	const args = process.argv;
	const command = args[2];

	if (command === 'preview') {
		await previewCommand();
	} else {
		console.log(`Command ${command} not found.`);
		process.exit(1);
	}
});

export * from './render';
