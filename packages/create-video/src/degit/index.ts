import fs from 'fs';
import path from 'path';
import tar from 'tar';
import {Log} from '../log';

import https from 'https';
import {homedir, tmpdir} from 'os';

const homeOrTemp = homedir() || tmpdir();

export function mkdirp(dir: string) {
	const parent = path.dirname(dir);
	if (parent === dir) return;

	mkdirp(parent);

	try {
		fs.mkdirSync(dir);
	} catch (err) {
		if ((err as {code: string}).code !== 'EEXIST') throw err;
	}
}

export function fetch(url: string, dest: string) {
	return new Promise<void>((resolve, reject) => {
		https
			.get(url, (response) => {
				const code = response.statusCode as number;
				if (code >= 400) {
					reject(
						new Error(
							`Network request to ${url} failed with code ${code} (${response.statusMessage})`
						)
					);
				} else if (code >= 300) {
					fetch(response.headers.location as string, dest)
						.then(resolve)
						.catch(reject);
				} else {
					response
						.pipe(fs.createWriteStream(dest))
						.on('finish', () => resolve())
						.on('error', reject);
				}
			})
			.on('error', reject);
	});
}

const base = path.join(homeOrTemp, '.degit');

export const degit = async (
	repoOrg: string,
	repoName: string,
	src: string,
	dest: string
) => {
	const dir = path.join(base, repoOrg, repoName);

	await cloneWithTar(src, dir, dest);
};

async function cloneWithTar(src: string, dir: string, dest: string) {
	const file = `${dir}/HEAD.tar.gz`;
	const url = `${src}/archive/HEAD.tar.gz`;

	try {
		try {
			fs.statSync(file);
		} catch (err) {
			mkdirp(path.dirname(file));

			await fetch(url, file);
		}
	} catch (err) {
		Log.error('Could not download ' + url);
		Log.error(err);
		process.exit(1);
	}

	mkdirp(dest);
	await untar(file, dest);
}

function untar(file: string, dest: string) {
	return tar.extract(
		{
			file,
			strip: 1,
			C: dest,
		},
		[]
	);
}
