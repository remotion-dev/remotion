import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
	readFileSync(path.join(root, '../assets.json'), 'utf8'),
);
for (const target of Object.keys(manifest.archives)) {
	const bindings = execFileSync(
		'tar',
		['-xOf', path.join(root, 'zips', `${target}.gz`), 'bindings.rs'],
		{maxBuffer: 10 * 1024 * 1024},
	);
	writeFileSync(path.join(root, 'bindings', `${target}.rs`), bindings);
}
