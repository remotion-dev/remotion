import execa from 'execa';
import {createReadStream} from 'fs';
import {Readable} from 'stream';
import {makeNamedPipeLocation, writeToNamedPipe} from './create-named-pipe';

export const concatenateChunked = async (
	pipeName: string,
	outPipeName: string,
	files: string[]
): Promise<Readable> => {
	for (const file of files) {
		writeToNamedPipe(Readable.from(`file '${file}'\n`), pipeName);
	}

	const readStream = createReadStream(makeNamedPipeLocation(outPipeName));

	const task = execa('ffmpeg', [
		'-y',
		'-f',
		'concat',
		'-safe',
		'0',
		'-i',
		makeNamedPipeLocation(pipeName),
		'-c:v',
		'copy',
		'-c:a',
		'aac',
		'-y',
		'-f',
		'mov',
		makeNamedPipeLocation(outPipeName),
	]);

	task.stderr?.pipe(process.stderr);

	return readStream;
};
