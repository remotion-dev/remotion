import xns from 'xns';
import {bundleCommand} from './bundle';
import {previewCommand} from './preview';

export const bundle = xns(async () => {
	const args = process.argv;
	const command = args[2];

	if (command === 'render') {
		await bundleCommand();
	} else if (command === 'preview') {
		await previewCommand();
	} else {
		console.log(`Command ${command} not found.`);
		process.exit(1);
	}
});
