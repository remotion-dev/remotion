import xns from 'xns';
import {previewCommand} from './preview';
import {render} from './render';

export const cli = xns(async () => {
	const args = process.argv;
	const command = args[2];

	if (command === 'preview') {
		await previewCommand();
	} else if (command === 'render') {
		await render();
	} else {
		console.log(`Command ${command} not found.`);
		process.exit(1);
	}
});

export * from './render';
