import execa from 'execa';
import {createReadStream, createWriteStream, existsSync} from 'fs';
import path from 'path';
import {Readable} from 'stream';
import {tmpDir} from '../shared/tmpdir';

const namedPipeFolder = tmpDir('named-pipes');

export const makeNamedPipeLocation = (pipe: string) => {
	return path.join(namedPipeFolder, pipe);
};

export const createNamedPipe = async (name: string) => {
	await execa('mkfifo', [makeNamedPipeLocation(name)]);
};

export const writeToNamedPipe = async (content: Readable, name: string) => {
	content.pipe(createWriteStream(makeNamedPipeLocation(name)));
};

export const deleteNamedPipe = async (name: string) => {
	if (existsSync(makeNamedPipeLocation(name))) {
		await execa('rm', [makeNamedPipeLocation(name)]);
	}
};

export const readFromNamedPipe = async (
	name: string,
	onData: (data: string | Buffer) => void
) => {
	return new Promise<void>((resolve, reject) => {
		createReadStream(makeNamedPipeLocation(name))
			.on('data', onData)
			.on('error', (err) => reject(err))
			.on('end', () => {
				resolve();
			});
	});
};
