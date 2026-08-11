// Walk the transitive workspace dependencies of @remotion/cli and pack each
// one with `bun pm pack`, so the Dockerfiles can install the local build of
// the renderer (with our --enable-blink-features=CanvasDrawElement change)
// instead of pulling the published version from npm.
import {readFileSync, readdirSync, rmSync, mkdirSync, writeFileSync} from 'fs';
import {join, resolve} from 'path';
import {$} from 'bun';

const ROOT = resolve(import.meta.dir, '../..');
const PACKAGES_DIR = join(ROOT, 'packages');
const OUT_DIR = resolve(import.meta.dir, 'tarballs');

type Pkg = {name: string; dir: string; deps: string[]};

const readPkg = (dir: string): Pkg | null => {
	try {
		const json = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
		const deps = {
			...json.dependencies,
			...json.peerDependencies,
			...json.optionalDependencies,
		};
		const wsDeps = Object.entries(deps)
			.filter(([, v]) => typeof v === 'string' && (v as string).startsWith('workspace:'))
			.map(([k]) => k);
		return {name: json.name, dir, deps: wsDeps};
	} catch {
		return null;
	}
};

const allPkgs: Record<string, Pkg> = {};
for (const entry of readdirSync(PACKAGES_DIR)) {
	const dir = join(PACKAGES_DIR, entry);
	const pkg = readPkg(dir);
	if (pkg) allPkgs[pkg.name] = pkg;
}

const visited = new Set<string>();
const order: Pkg[] = [];
const visit = (name: string) => {
	if (visited.has(name)) return;
	visited.add(name);
	const pkg = allPkgs[name];
	if (!pkg) return;
	for (const d of pkg.deps) visit(d);
	order.push(pkg);
};

visit('@remotion/cli');
console.log(`Packing ${order.length} workspace packages...`);

rmSync(OUT_DIR, {recursive: true, force: true});
mkdirSync(OUT_DIR, {recursive: true});

for (const pkg of order) {
	console.log(`  pack ${pkg.name}`);
	await $`cd ${pkg.dir} && bun pm pack --destination ${OUT_DIR} --quiet`.quiet();
}

console.log(`\nTarballs in ${OUT_DIR}:`);
for (const f of readdirSync(OUT_DIR).sort()) console.log(`  ${f}`);

// Map package name -> its tarball filename (relative to the Docker workdir
// where this package.json will be installed).
const tarballByName: Record<string, string> = {};
for (const pkg of order) {
	const json = JSON.parse(readFileSync(join(pkg.dir, 'package.json'), 'utf-8'));
	const safe = pkg.name.replace('@', '').replace('/', '-');
	tarballByName[pkg.name] = `./tarballs/${safe}-${json.version}.tgz`;
}

// Generate a package.json that lists every workspace tarball as a direct
// dependency AND adds an `overrides` entry, so transitive resolution picks
// the local tarball instead of the same-versioned registry copy.
const localPkg = {
	name: 'remotion-local-cli-runner',
	private: true,
	version: '0.0.0',
	dependencies: tarballByName,
	overrides: tarballByName,
};
writeFileSync(
	resolve(import.meta.dir, 'local-cli-package.json'),
	JSON.stringify(localPkg, null, 2) + '\n',
);
console.log('\nWrote local-cli-package.json');
