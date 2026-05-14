import {routes} from './app/routes';
import {notFound, origin, port, repoRoot} from './app/shared';
import {runCommand} from './command';
import {checkPiAvailable} from './pi';

const server = Bun.serve({
	error: (error) => {
		process.stderr.write(
			`Skills eval server error: ${
				error instanceof Error ? error.stack : String(error)
			}\n`,
		);

		return new Response('Internal Server Error', {status: 500});
	},
	fetch: () => notFound(),
	hostname: '127.0.0.1',
	port,
	routes,
});

process.stdout.write(`Skills eval server running at ${origin}\n`);

checkPiAvailable({cwd: repoRoot})
	.then((availability) => {
		if (!availability.ok) {
			process.stderr.write(`${availability.message}\n`);
		}
	})
	.catch((error: unknown) => {
		process.stderr.write(
			`Could not check Pi availability: ${
				error instanceof Error ? error.message : String(error)
			}\n`,
		);
	});

if (process.platform === 'darwin' && process.stdout.isTTY && !process.env.CI) {
	const openBrowser = async () => {
		await runCommand({
			command: ['open', origin],
			cwd: repoRoot,
		});
	};

	openBrowser().catch((error: unknown) => {
		process.stderr.write(
			`Could not open browser: ${
				error instanceof Error ? error.message : String(error)
			}\n`,
		);
	});
}

process.on('SIGINT', () => {
	server.stop();
	process.exit(0);
});
