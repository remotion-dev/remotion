import path from 'node:path';

const repositoryRoot = path.resolve(import.meta.dir, '../../..');
const clientEntryPoint = path.join(import.meta.dir, 'client.ts');

const getPackageName = () => {
	const packageArgumentIndex = process.argv.indexOf('--package');
	const packageName =
		packageArgumentIndex === -1
			? 'example'
			: process.argv[packageArgumentIndex + 1];

	if (packageName !== 'example' && packageName !== 'brand') {
		throw new Error(
			`--package must be either "example" or "brand", got ${JSON.stringify(packageName)}`,
		);
	}

	return packageName;
};

const startReactScanStudio = async () => {
	if (process.argv.includes('--help')) {
		console.log('bun run react-scan:capture [-- --package <example|brand>]');
		return;
	}

	const packageName = getPackageName();

	console.log('Building the React Scan-enabled Studio entry...');
	const build = Bun.spawn(
		['bunx', 'turbo', 'run', 'make', `--filter=@remotion/${packageName}...`],
		{
			cwd: repositoryRoot,
			stderr: 'inherit',
			stdout: 'inherit',
		},
	);
	if ((await build.exited) !== 0) {
		throw new Error('Could not build the Studio bundler for React Scan');
	}

	console.log(
		`Starting ${packageName} Studio with React Scan WebMCP tools enabled...`,
	);
	const studio = Bun.spawn(['bun', 'run', 'dev', '--', '--force-new'], {
		cwd: path.join(repositoryRoot, 'packages', packageName),
		env: {
			...process.env,
			REMOTION_REACT_SCAN_ENTRY_POINT: clientEntryPoint,
		},
		stderr: 'inherit',
		stdin: 'inherit',
		stdout: 'inherit',
	});

	const stopStudio = () => studio.kill();
	process.once('SIGINT', stopStudio);
	process.once('SIGTERM', stopStudio);
	process.exitCode = await studio.exited;
};

if (import.meta.main) {
	await startReactScanStudio();
}
