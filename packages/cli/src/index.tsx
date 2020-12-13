import path from 'path';
import xns from 'xns';
import {bundleCommand} from './bundle';
import {previewCommand} from './preview';

export const bundle = xns(
	async (
		fullPath = path.join(process.cwd(), '..', 'example', 'src', 'index.tsx')
	) => {
		const args = process.argv;
		const command = args[2];

		if (command === 'render') {
			await bundleCommand(fullPath);
		} else if (command === 'preview') {
			await previewCommand();
		} else {
			console.log(`Command ${command} not found.`);
			process.exit(1);
		}
	}
);
