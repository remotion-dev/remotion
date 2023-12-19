import {execSync} from 'node:child_process';
import {
	copyFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readdirSync,
	rmSync,
	unlinkSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {toolchains} from './toolchains.mjs';

const isWin = os.platform() === 'win32';
const where = isWin ? 'where' : 'which';

if (os.platform() === 'win32') {
	console.log('Windows CI is broken - revisit in 14 days');
	console.log('https://github.com/actions/runner-images/issues/8598');
	if (Date.now() > 1703980800000) {
		process.exit(1);
	}

	process.exit(0);
}

function isMusl() {
	const {glibcVersionRuntime} = process.report.getReport().header;
	return !glibcVersionRuntime;
}

const targets = [
	'x86_64-pc-windows-gnu',
	'x86_64-unknown-linux-musl',
	'aarch64-unknown-linux-gnu',
	'x86_64-unknown-linux-gnu',
	'aarch64-apple-darwin',
	'x86_64-apple-darwin',
	'aarch64-unknown-linux-musl',
];

export const getTarget = () => {
	switch (process.platform) {
		case 'win32':
			switch (process.arch) {
				case 'x64':
					return 'x86_64-pc-windows-gnu';
				default:
					throw new Error(
						`Unsupported architecture on Windows: ${process.arch}`,
					);
			}

		case 'darwin':
			switch (process.arch) {
				case 'x64':
					return 'x86_64-apple-darwin';
				case 'arm64':
					return 'aarch64-apple-darwin';
				default:
					throw new Error(`Unsupported architecture on macOS: ${process.arch}`);
			}

		case 'linux':
			switch (process.arch) {
				case 'x64':
					if (isMusl()) {
						return 'x86_64-unknown-linux-musl';
					}

					return 'x86_64-unknown-linux-gnu';
				case 'arm64':
					if (isMusl()) {
						return 'aarch64-unknown-linux-musl';
					}

					return 'aarch64-unknown-linux-gnu';

				default:
					throw new Error(`Unsupported architecture on Linux: ${process.arch}`);
			}

		default:
			throw new Error(
				`Unsupported OS: ${process.platform}, architecture: ${process.arch}`,
			);
	}
};

const hasCargo = () => {
	try {
		execSync(`${where} cargo`);
		return true;
	} catch (err) {
		return false;
	}
};

const debug = process.argv.includes('--debug');
const mode = debug ? 'debug' : 'release';

const copyDestinations = {
	'aarch64-unknown-linux-gnu': {
		from: `target/aarch64-unknown-linux-gnu/${mode}/compositor`,
		to: '../compositor-linux-arm64-gnu/compositor',
		dir: '../compositor-linux-arm64-gnu',
	},
	'aarch64-unknown-linux-musl': {
		from: 'target/aarch64-unknown-linux-musl/' + mode + '/compositor',
		to: '../compositor-linux-arm64-musl/compositor',
		dir: '../compositor-linux-arm64-musl',
	},
	'x86_64-unknown-linux-gnu': {
		from: 'target/x86_64-unknown-linux-gnu/' + mode + '/compositor',
		to: '../compositor-linux-x64-gnu/compositor',
		dir: '../compositor-linux-x64-gnu',
	},
	'x86_64-unknown-linux-musl': {
		from: 'target/x86_64-unknown-linux-musl/' + mode + '/compositor',
		to: '../compositor-linux-x64-musl/compositor',
		dir: '../compositor-linux-x64-musl',
	},
	'x86_64-apple-darwin': {
		from: 'target/x86_64-apple-darwin/' + mode + '/compositor',
		to: '../compositor-darwin-x64/compositor',
		dir: '../compositor-darwin-x64',
	},
	'aarch64-apple-darwin': {
		from: 'target/aarch64-apple-darwin/' + mode + '/compositor',
		to: '../compositor-darwin-arm64/compositor',
		dir: '../compositor-darwin-arm64',
	},
	'x86_64-pc-windows-gnu': {
		from: 'target/x86_64-pc-windows-gnu/' + mode + '/compositor.exe',
		to: '../compositor-win32-x64-msvc/compositor.exe',
		dir: '../compositor-win32-x64-msvc',
	},
};

if (!hasCargo()) {
	console.log('Environment has no cargo. Skipping Rust builds.');
	process.exit(0);
}

const nativeArch = getTarget();

const all = process.argv.includes('--all');
const cloudrun = process.argv.includes('--cloudrun');
const lambda = process.argv.includes('--lambda');
if (!existsSync('toolchains') && all) {
	throw new Error(
		'Run "node install-toolchain.mjs" if you want to build all platforms',
	);
}

for (const toolchain of toolchains) {
	if (!existsSync(path.join('toolchains', toolchain)) && all) {
		throw new Error(
			`Toolchain for ${toolchain} not found. Run "node install-toolchain.mjs" if you want to build all platforms`,
		);
	}
}

const stdout = execSync('cargo metadata --format-version=1');
const {packages} = JSON.parse(stdout);

const rustFfmpegSys = packages.find((p) => p.name === 'ffmpeg-sys-next');

if (!rustFfmpegSys) {
	console.error(
		'Could not find ffmpeg-sys-next when running cargo metadata --format-version=1',
	);
	process.exit(1);
}

const manifest = rustFfmpegSys.manifest_path;
const binariesDirectory = path.join(path.dirname(manifest), 'zips');
const archs = all
	? targets
	: lambda
	? ['aarch64-unknown-linux-gnu']
	: cloudrun
	? ['x86_64-unknown-linux-gnu']
	: [nativeArch];

for (const arch of archs) {
	const ffmpegFolder = path.join(copyDestinations[arch].dir, 'ffmpeg');
	if (!existsSync(ffmpegFolder)) {
		mkdirSync(ffmpegFolder);
	}

	execSync(`tar xf ${binariesDirectory}/${arch}.gz -C ${ffmpegFolder}`, {
		stdio: 'inherit',
	});
	const command = `cargo build ${debug ? '' : '--release'} --target=${arch}`;
	console.log(command);

	// debuginfo will keep symbols, which are used for backtrace.
	// symbols makes it a tiny bit smaller, but error messages will be hard to debug.

	const optimizations = all
		? '-C opt-level=3 -C lto=fat -C strip=debuginfo -C embed-bitcode=yes'
		: '';

	execSync(command, {
		stdio: 'inherit',
		env: {
			...process.env,
			RUSTFLAGS: optimizations,
			CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER:
				nativeArch === 'aarch64-unknown-linux-gnu'
					? undefined
					: 'toolchains/aarch64_gnu_toolchain/bin/aarch64-unknown-linux-gnu-gcc',
			CARGO_TARGET_AARCH64_UNKNOWN_LINUX_MUSL_LINKER:
				nativeArch === 'aarch64-unknown-linux-musl'
					? undefined
					: 'toolchains/aarch64_musl_toolchain/bin/aarch64-unknown-linux-musl-gcc',
			CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_LINKER:
				nativeArch === 'x86_64-unknown-linux-gnu'
					? undefined
					: path.join(
							process.cwd(),
							'toolchains/x86_64_gnu_toolchain/bin/x86_64-unknown-linux-gnu-gcc',
					  ),
			CARGO_TARGET_X86_64_UNKNOWN_LINUX_MUSL_LINKER:
				nativeArch === 'x86_64-unknown-linux-musl'
					? undefined
					: 'toolchains/x86_64_musl_toolchain/bin/x86_64-unknown-linux-musl-gcc',
		},
	});
	const copyInstructions = copyDestinations[arch];

	const libDir = path.join(
		copyDestinations[arch].dir,
		'ffmpeg',
		'remotion',
		'lib',
	);
	const binDir = path.join(
		copyDestinations[arch].dir,
		'ffmpeg',
		'remotion',
		'bin',
	);
	const files = readdirSync(libDir);
	for (const file of files) {
		if (file.endsWith('.a')) {
			unlinkSync(path.join(libDir, file));
		} else if (file.endsWith('.dylib') && file.split('.').length === 3) {
			unlinkSync(path.join(libDir, file));
		} else if (file.endsWith('.la')) {
			unlinkSync(path.join(libDir, file));
		} else if (file.endsWith('.def')) {
			unlinkSync(path.join(libDir, file));
		} else if (file.includes('libvpx') && arch !== 'x86_64-pc-windows-gnu') {
			unlinkSync(path.join(libDir, file));
		} else if (file.endsWith('.lib')) {
			unlinkSync(path.join(libDir, file));
		}
	}

	const binFiles = readdirSync(binDir);
	for (const file of binFiles) {
		if (!file.includes('ffmpeg') && !file.includes('ffprobe')) {
			unlinkSync(path.join(binDir, file));
		}
	}

	rmSync(path.join(copyDestinations[arch].dir, 'ffmpeg', 'remotion', 'share'), {
		recursive: true,
	});
	rmSync(
		path.join(copyDestinations[arch].dir, 'ffmpeg', 'remotion', 'include'),
		{
			recursive: true,
		},
	);
	rmSync(path.join(copyDestinations[arch].dir, 'ffmpeg', 'bindings.rs'), {
		recursive: true,
	});
	copyFileSync(copyInstructions.from, copyInstructions.to);

	const output = execSync('npm pack --json', {
		cwd: copyDestinations[arch].dir,
		stdio: 'pipe',
	});

	const filename = JSON.parse(output.toString('utf-8'))[0].filename.replace(
		/^@remotion\//,
		'remotion-',
	);
	const tgzPath = path.join(
		process.cwd(),
		copyDestinations[arch].dir,
		filename,
	);

	const filesize = lstatSync(tgzPath).size;
	console.log('Zipped size:', (filesize / 1000000).toFixed(2) + 'MB');
	unlinkSync(tgzPath);
}
