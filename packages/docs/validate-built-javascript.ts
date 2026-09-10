import path from 'path';

const buildDirectory = path.join(import.meta.dir, 'build');
const transpiler = new Bun.Transpiler({loader: 'js'});
let filesChecked = 0;

for await (const relativePath of new Bun.Glob('**/*.js').scan({
	cwd: buildDirectory,
	onlyFiles: true,
})) {
	const file = path.join(buildDirectory, relativePath);
	try {
		transpiler.scan(await Bun.file(file).text());
	} catch (error) {
		throw new Error(`Generated invalid JavaScript in ${relativePath}`, {
			cause: error,
		});
	}

	filesChecked++;
}

console.log(`Validated ${filesChecked} generated JavaScript files.`);
