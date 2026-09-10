import path from 'path';

const buildDirectory = path.join(import.meta.dir, 'build');
const transpiler = new Bun.Transpiler({loader: 'js'});
const contentHashLength = 12;
let filesChecked = 0;

for (const {relativeDirectory, extension} of [
	{relativeDirectory: 'assets/js', extension: 'js'},
	{relativeDirectory: 'assets/css', extension: 'css'},
]) {
	let assetsFound = 0;
	const expectedFilename = new RegExp(
		`\\.[0-9a-f]{${contentHashLength}}\\.${extension}$`,
	);

	for await (const filename of new Bun.Glob(`*.${extension}`).scan({
		cwd: path.join(buildDirectory, relativeDirectory),
		onlyFiles: true,
	})) {
		if (!expectedFilename.test(filename)) {
			throw new Error(
				`Expected a ${contentHashLength}-character content hash in ${relativeDirectory}/${filename}`,
			);
		}

		assetsFound++;
	}

	if (assetsFound === 0) {
		throw new Error(`No generated ${extension.toUpperCase()} assets found`);
	}
}

for await (const relativePath of new Bun.Glob('**/*.js').scan({
	cwd: buildDirectory,
	onlyFiles: true,
})) {
	const file = path.join(buildDirectory, relativePath);
	try {
		// This catches syntax corruption, but not hash replacements that leave
		// syntactically valid JavaScript. Longer hashes make both cases less likely.
		transpiler.scan(await Bun.file(file).text());
	} catch (error) {
		throw new Error(`Generated invalid JavaScript in ${relativePath}`, {
			cause: error,
		});
	}

	filesChecked++;
}

console.log(`Validated ${filesChecked} generated JavaScript files.`);
