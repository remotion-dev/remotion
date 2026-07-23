export const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isUrl = (value: string): boolean => {
	try {
		const parsed = new URL(value);
		return parsed.href.length > 0;
	} catch {
		return false;
	}
};

const nodeBuiltinPackages = new Set([
	'assert',
	'async_hooks',
	'buffer',
	'child_process',
	'cluster',
	'console',
	'constants',
	'crypto',
	'dgram',
	'diagnostics_channel',
	'dns',
	'domain',
	'events',
	'fs',
	'http',
	'http2',
	'https',
	'inspector',
	'module',
	'net',
	'os',
	'path',
	'perf_hooks',
	'process',
	'punycode',
	'querystring',
	'readline',
	'repl',
	'sea',
	'sqlite',
	'stream',
	'string_decoder',
	'sys',
	'test',
	'timers',
	'tls',
	'trace_events',
	'tty',
	'url',
	'util',
	'v8',
	'vm',
	'wasi',
	'worker_threads',
	'zlib',
]);

const scopedPackagePattern = /^(?:@([^/]+?)\/)?([^/]+?)$/;
const reservedPackageNames = new Set(['node_modules', 'favicon.ico']);

export const isValidPackageName = (packageName: string): boolean => {
	if (
		packageName.length === 0 ||
		packageName.length > 214 ||
		packageName.startsWith('.') ||
		packageName.startsWith('_') ||
		packageName.startsWith('-') ||
		packageName.trim() !== packageName ||
		packageName.toLowerCase() !== packageName ||
		reservedPackageNames.has(packageName) ||
		nodeBuiltinPackages.has(packageName) ||
		/[~'!()*]/.test(packageName.split('/').at(-1) ?? '')
	) {
		return false;
	}

	if (encodeURIComponent(packageName) === packageName) {
		return true;
	}

	const match = packageName.match(scopedPackagePattern);
	if (!match) {
		return false;
	}

	const [, scope, name] = match;
	return (
		scope !== undefined &&
		name !== undefined &&
		encodeURIComponent(scope) === scope &&
		encodeURIComponent(name) === name
	);
};
