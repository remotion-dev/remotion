import execa from 'execa';
import {createWriteStream} from 'fs';
import path from 'path';
import {Readable} from 'stream';
import {concatenateChunked} from '../rendering/chunked-concatenation';
import {
	createNamedPipe,
	deleteNamedPipe,
	readFromNamedPipe,
	writeToNamedPipe,
} from '../rendering/create-named-pipe';

test('Named pipes', async () => {
	const pipeName = 'mypipe';
	expect.hasAssertions();
	await createNamedPipe(pipeName);
	writeToNamedPipe(Readable.from('hello'), pipeName);
	await readFromNamedPipe(pipeName, (data) => {
		expect(data.toString()).toBe('hello');
	});
	await deleteNamedPipe(pipeName);
});

test('Concatenate chunks', async () => {
	const testerFile = path.resolve(__dirname, 'tester.mp4');
	const pipeName = 'concatpipe';
	const outPipeName = 'outpipename';
	await deleteNamedPipe(pipeName);
	await deleteNamedPipe(outPipeName);
	await createNamedPipe(pipeName);
	await createNamedPipe(outPipeName);
	const reader = await concatenateChunked(pipeName, outPipeName, [
		testerFile,
		testerFile,
		testerFile,
		testerFile,
		testerFile,
	]);

	const outname = 'outtest.mp4';
	await new Promise<void>((resolve) => {
		reader.pipe(createWriteStream(outname)).on('finish', () => resolve());
	});
	const {stderr} = await execa('ffprobe', [outname]);
	expect(stderr).toContain('Video: h264');
	expect(stderr).toContain('Duration: 00:00:03.84');
	// unlinkSync(outname);
	await deleteNamedPipe(pipeName);
	await deleteNamedPipe(outPipeName);
});
