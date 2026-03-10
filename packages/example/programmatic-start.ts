import {fileURLToPath} from 'node:url';
import {startStudio} from '@remotion/studio';

const remotionRoot = fileURLToPath(new URL('.', import.meta.url));

const studioServer = await startStudio({
	remotionRoot,
	entryPoint: 'src/index.ts',
});

console.log(`Studio available at ${studioServer.url}`);

// we can close if this call created the Studio instance
if (!studioServer.reusedExistingStudio) {
	// await studioServer.close();
}

// Studio was already running and got reused
if (studioServer.reusedExistingStudio) {
	console.log(`Reused existing Studio on port ${studioServer.port}`);
}