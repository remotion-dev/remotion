import {startServer} from '@jonny/motion-bundler';
import path from 'path';
import xns from 'xns';

xns(async () => {
	const args = process.argv;
	const file = args[2];
	const fullPath = path.join(process.cwd(), file);

	startServer(path.resolve(__dirname, 'previewEntry.tsx'), fullPath);
	await new Promise(() => void 0);
});
