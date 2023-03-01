import {execSync} from 'child_process';
import {
	copyFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readdirSync,
	rmSync,
	unlinkSync,
} from 'fs';
import os from 'os';
import path from 'path';

const isWin = os.platform() === 'win32';
const where = isWin ? 'where' : 'which';

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
						`Unsupported architecture on Windows: ${process.arch}`
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
				`Unsupported OS: ${process.platform}, architecture: ${process.arch}`
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

const copyDestinations = {
	'aarch64-unknown-linux-gnu': {
		from: 'target/aarch64-unknown-linux-gnu/release/compositor',
		to: '../compositor-linux-arm64-gnu/compositor',
		dir: '../compositor-linux-arm64-gnu',
		ffmpeg_bin: 'linux-arm.gz',
	},
	'aarch64-unknown-linux-musl': {
		from: 'target/aarch64-unknown-linux-musl/release/compositor',
		to: '../compositor-linux-arm64-musl/compositor',
		dir: '../compositor-linux-arm64-musl',
		ffmpeg_bin: 'linux-arm-musl.gz',
	},
	'x86_64-unknown-linux-gnu': {
		from: 'target/x86_64-unknown-linux-gnu/release/compositor',
		to: '../compositor-linux-x64-gnu/compositor',
		dir: '../compositor-linux-x64-gnu',
		ffmpeg_bin: 'linux-x64.gz',
	},
	'x86_64-unknown-linux-musl': {
		from: 'target/x86_64-unknown-linux-musl/release/compositor',
		to: '../compositor-linux-x64-musl/compositor',
		dir: '../compositor-linux-x64-musl',
		ffmpeg_bin: 'linux-x64-musl.gz',
	},
	'x86_64-apple-darwin': {
		from: 'target/x86_64-apple-darwin/release/compositor',
		to: '../compositor-darwin-x64/compositor',
		dir: '../compositor-darwin-x64',
		ffmpeg_bin: 'macos-x64.gz',
	},
	'aarch64-apple-darwin': {
		from: 'target/aarch64-apple-darwin/release/compositor',
		to: '../compositor-darwin-arm64/compositor',
		dir: '../compositor-darwin-arm64',
		ffmpeg_bin: 'macos-arm.gz',
	},
	'x86_64-pc-windows-gnu': {
		from: 'target/x86_64-pc-windows-gnu/release/compositor.exe',
		to: '../compositor-win32-x64-msvc/compositor.exe',
		dir: '../compositor-win32-x64-msvc',
		ffmpeg_bin: 'windows.gz',
	},
};

if (!hasCargo()) {
	console.log('Environment has no cargo. Skipping Rust builds.');
	process.exit(0);
}

const nativeArch = getTarget();

const all = process.argv.includes('--all');
if (!existsSync('toolchains') && all) {
	throw new Error(
		'Run "node install-toolchain.mjs" if you want to build all platforms'
	);
}

const archs = all ? targets : [nativeArch];

for (const arch of archs) {
	const ffmpegFolder = path.join(copyDestinations[arch].dir, 'ffmpeg');
	if (!existsSync(ffmpegFolder)) {
		mkdirSync(ffmpegFolder);
	}

	execSync(
		`tar xf ffmpeg/${copyDestinations[arch].ffmpeg_bin} -C ${ffmpegFolder}`
	);
	const link = path.join(process.cwd(), ffmpegFolder, 'remotion', 'include');
	const command = `cargo build --release --target=${arch}`;
	console.log(command);
	execSync(command, {
		stdio: 'inherit',
		env: {
			...process.env,
			REMOTION_FFMPEG_RUST_BINDINGS_OUT_DIR: path.join(
				process.cwd(),
				copyDestinations[arch].dir,
				'ffmpeg'
			),
			CPATH:
				arch === 'aarch64-apple-darwin'
					? '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include'
					: undefined,
			RUSTFLAGS: `-L ${link}`,
			FFMPEG_DIR: path.join(
				process.cwd(),
				copyDestinations[arch].dir,
				'ffmpeg',
				'remotion'
			),
			CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER:
				nativeArch === 'aarch64-unknown-linux-gnu'
					? undefined
					: path.join(
							process.cwd(),
							'toolchains/aarch_gnu_toolchain/bin/aarch64-unknown-linux-gnu-gcc'
					  ),
			CARGO_TARGET_AARCH64_UNKNOWN_LINUX_MUSL_LINKER:
				nativeArch === 'aarch64-unknown-linux-musl'
					? undefined
					: 'toolchains/aarch64-musl-toolchain/bin/aarch64-unknown-linux-musl-gcc',
			CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_LINKER:
				nativeArch === 'x86_64-unknown-linux-gnu'
					? undefined
					: path.join(
							process.cwd(),
							'toolchains/x86_64_gnu_toolchain/bin/x86_64-unknown-linux-gnu-gcc'
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
		'lib'
	);
	const binDir = path.join(
		copyDestinations[arch].dir,
		'ffmpeg',
		'remotion',
		'bin'
	);
	const files = readdirSync(libDir);
	for (const file of files) {
		if (file.endsWith('.a')) {
			unlinkSync(path.join(libDir, file));
		} else if (lstatSync(path.join(libDir, file)).isSymbolicLink()) {
			unlinkSync(path.join(libDir, file));
		} else if (file.endsWith('.dylib') && file.split('.').length !== 3) {
			unlinkSync(path.join(libDir, file));
		} else if (file.endsWith('.la')) {
			unlinkSync(path.join(libDir, file));
		} else if (file.endsWith('.def')) {
			unlinkSync(path.join(libDir, file));
		} else if (file.includes('libvpx')) {
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

	rmSync(path.join(libDir, 'pkgconfig'), {recursive: true});
	rmSync(path.join(copyDestinations[arch].dir, 'ffmpeg', 'remotion', 'share'), {
		recursive: true,
	});
	rmSync(
		path.join(copyDestinations[arch].dir, 'ffmpeg', 'remotion', 'include'),
		{
			recursive: true,
		}
	);
	rmSync(path.join(copyDestinations[arch].dir, 'ffmpeg', 'bindings.rs'), {
		recursive: true,
	});
	copyFileSync(copyInstructions.from, copyInstructions.to);
}
