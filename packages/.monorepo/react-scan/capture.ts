import path from 'node:path';

const repositoryRoot = path.resolve(import.meta.dir, '../../..');
const clientEntryPoint = path.join(import.meta.dir, 'client.ts');

const startReactScanStudio = async () => {
	if (process.argv.includes('--help')) {
		console.log('bun run react-scan:capture');
		return;
	}

	console.log('Building the React Scan-enabled Studio entry...');
	const build = Bun.spawn(
		[
			'bunx',
			'turbo',
			'run',
			'make',
			'--filter=@remotion/studio-shared',
			'--filter=@remotion/bundler',
		],
		{
			cwd: repositoryRoot,
			stderr: 'inherit',
			stdout: 'inherit',
		},
	);
	if ((await build.exited) !== 0) {
		throw new Error('Could not build the Studio bundler for React Scan');
	}

	console.log('Starting Studio with React Scan WebMCP tools enabled...');
	const studio = Bun.spawn(['bun', 'run', 'dev', '--', '--force-new'], {
		cwd: path.join(repositoryRoot, 'packages', 'example'),
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
