import fs from 'fs';
import https from 'https';
import {tmpdir} from 'os';
import path from 'path';
import tar from 'tar';
import {mkdirp} from './mkdirp';

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

export const degit = async ({
	repoOrg,
	repoName,
	dest,
}: {
	repoOrg: string;
	repoName: string;
	dest: string;
}) => {
	const base = path.join(tmpdir(), '.degit');
	const dir = path.join(base, repoOrg, repoName);
	const file = `${dir}/HEAD.tar.gz`;
	const url = `https://github.com/${repoOrg}/${repoName}/archive/HEAD.tar.gz`;

	mkdirp(path.dirname(file));
	await fetch(url, file);

	mkdirp(dest);
	await untar(file, dest);
	fs.unlinkSync(file);
};

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
