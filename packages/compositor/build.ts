import {execSync} from 'node:child_process';
import {
	copyFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readdirSync,
	renameSync,
	rmdirSync,
	rmSync,
	statSync,
	unlinkSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {toolchains} from './toolchains';

const isWin = os.platform() === 'win32';
const where = isWin ? 'where' : 'which';

if (os.platform() === 'win32') {
	console.log('Windows CI is broken - needs to be cross-compiled');
	process.exit(0);
}

function isMusl() {
	// @ts-expect-error
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
		from: `target/aarch64-unknown-linux-gnu/${mode}/remotion`,
		to: '../compositor-linux-arm64-gnu/remotion',
		dir: '../compositor-linux-arm64-gnu',
	},
	'aarch64-unknown-linux-musl': {
		from: `target/aarch64-unknown-linux-musl/${mode}/remotion`,
		to: '../compositor-linux-arm64-musl/remotion',
		dir: '../compositor-linux-arm64-musl',
	},
	'x86_64-unknown-linux-gnu': {
		from: `target/x86_64-unknown-linux-gnu/${mode}/remotion`,
		to: '../compositor-linux-x64-gnu/remotion',
		dir: '../compositor-linux-x64-gnu',
	},
	'x86_64-unknown-linux-musl': {
		from: `target/x86_64-unknown-linux-musl/${mode}/remotion`,
		to: '../compositor-linux-x64-musl/remotion',
		dir: '../compositor-linux-x64-musl',
	},
	'x86_64-apple-darwin': {
		from: `target/x86_64-apple-darwin/${mode}/remotion`,
		to: '../compositor-darwin-x64/remotion',
		dir: '../compositor-darwin-x64',
	},
	'aarch64-apple-darwin': {
		from: `target/aarch64-apple-darwin/${mode}/remotion`,
		to: '../compositor-darwin-arm64/remotion',
		dir: '../compositor-darwin-arm64',
	},
	'x86_64-pc-windows-gnu': {
		from: `target/x86_64-pc-windows-gnu/${mode}/remotion.exe`,
		to: '../compositor-win32-x64-msvc/remotion.exe',
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
		'Run "bun install-toolchain.ts" if you want to build all platforms',
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
const {packages} = JSON.parse(stdout as unknown as string);

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
	if (existsSync(ffmpegFolder)) {
		rmSync(ffmpegFolder, {recursive: true});
	}

	mkdirSync(ffmpegFolder);

	// strip-components: extract in a flat folder structure
	execSync(
		`tar xf  ${binariesDirectory}/${arch}.gz -C ${ffmpegFolder} --strip-components 2`,
		{
			stdio: 'inherit',
		},
	);
	const filesInFfmpegFolder = readdirSync(ffmpegFolder);
	const filesToDelete = filesInFfmpegFolder.filter((file) => {
		return (
			file.endsWith('.h') ||
			file.endsWith('.a') ||
			file.endsWith('.la') ||
			file.endsWith('.hpp') ||
			statSync(path.join(ffmpegFolder, file)).isDirectory()
		);
	});
	for (const file of filesToDelete) {
		rmSync(path.join(ffmpegFolder, file), {recursive: true});
	}

	const filesInFfmpegFolder2 = readdirSync(ffmpegFolder);
	for (const file of filesInFfmpegFolder2) {
		if (file === 'ffmpeg') {
			renameSync(
				path.join(ffmpegFolder, file),
				path.join(ffmpegFolder, '..', 'ffmpeg_'),
			);
			continue;
		}

		renameSync(
			path.join(ffmpegFolder, file),
			path.join(ffmpegFolder, '..', file),
		);
	}

	rmdirSync(path.join(ffmpegFolder, '..', 'ffmpeg'));
	if (existsSync(path.join(ffmpegFolder, '..', 'bin'))) {
		rmSync(path.join(ffmpegFolder, '..', 'bin'), {recursive: true});
	}

	if (existsSync(path.join(ffmpegFolder, '..', 'ffmpeg_'))) {
		renameSync(
			path.join(ffmpegFolder, '..', 'ffmpeg_'),
			path.join(ffmpegFolder, '..', 'ffmpeg'),
		);
	}

	const command = `cargo build ${debug ? '' : '--release'} --target=${arch}`;
	console.log(command);

	// debuginfo will keep symbols, which are used for backtrace.
	// symbols makes it a tiny bit smaller, but error messages will be hard to debug.

	const rPathOrigin = arch.includes('linux')
		? `-C link-args=-Wl,-rpath,'$ORIGIN'`
		: '';

	const optimizations = all
		? `-C opt-level=3 -C lto=fat -C strip=debuginfo -C embed-bitcode=yes ${rPathOrigin}`
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

	if (arch.includes('linux')) {
		execSync(
			`patchelf --force-rpath --set-rpath '$ORIGIN' ${copyDestinations[arch].dir}/remotion`,
		);
	}

	const filesize = lstatSync(tgzPath).size;
	console.log('Zipped size:', (filesize / 1000000).toFixed(2) + 'MB');
	unlinkSync(tgzPath);
}
