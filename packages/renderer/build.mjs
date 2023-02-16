import {execSync} from 'child_process';
import {copyFileSync} from 'fs';
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
	'x86_64-apple-darwin',
	'aarch64-apple-darwin',
	'x86_64-unknown-linux-musl',
	'x86_64-unknown-linux-gnu',
	'aarch64-unknown-linux-musl',
	'aarch64-unknown-linux-gnu',
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
	},
	'aarch64-unknown-linux-musl': {
		from: 'target/aarch64-unknown-linux-musl/release/compositor',
		to: '../compositor-linux-arm64-musl/compositor',
		dir: '../compositor-linux-arm64-musl',
	},
	'x86_64-unknown-linux-gnu': {
		from: 'target/x86_64-unknown-linux-gnu/release/compositor',
		to: '../compositor-linux-x64-gnu/compositor',
		dir: '../compositor-linux-x64-gnu',
	},
	'x86_64-unknown-linux-musl': {
		from: 'target/x86_64-unknown-linux-musl/release/compositor',
		to: '../compositor-linux-x64-musl/compositor',
		dir: '../compositor-linux-x64-musl',
	},
	'x86_64-apple-darwin': {
		from: 'target/x86_64-apple-darwin/release/compositor',
		to: '../compositor-darwin-x64/compositor',
		dir: '../compositor-darwin-x64',
	},
	'aarch64-apple-darwin': {
		from: 'target/aarch64-apple-darwin/release/compositor',
		to: '../compositor-darwin-arm64/compositor',
		dir: '../compositor-darwin-arm64',
	},
	'x86_64-pc-windows-gnu': {
		from: 'target/x86_64-pc-windows-gnu/release/compositor.exe',
		to: '../compositor-win32-x64-msvc/compositor.exe',
		dir: '../compositor-win32-x64-msvc',
	},
};

if (hasCargo()) {
	const nativeArch = getTarget();
	const archs = process.argv.includes('--all') ? targets : [nativeArch];
	for (const arch of archs) {
		const command = `cargo build --release --target=${arch}`;
		console.log(command);
		execSync(command, {
			stdio: 'inherit',
			env: {
				...process.env,
				FFMPEG_DIR: path.join(
					process.cwd(),
					copyDestinations[arch].dir,
					'ffmpeg',
					'remotion'
				),
				CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER:
					nativeArch === 'aarch64-unknown-linux-gnu'
						? undefined
						: 'aarch64-unknown-linux-gnu-gcc',
				CARGO_TARGET_AARCH64_UNKNOWN_LINUX_MUSL_LINKER:
					nativeArch === 'aarch64-unknown-linux-musl'
						? undefined
						: 'aarch64-unknown-linux-musl-gcc',
				CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_LINKER:
					nativeArch === 'x86_64-unknown-linux-gnu'
						? undefined
						: 'x86_64-unknown-linux-gnu-gcc',
				CARGO_TARGET_X86_64_UNKNOWN_LINUX_MUSL_LINKER:
					nativeArch === 'x86_64-unknown-linux-musl'
						? undefined
						: 'x86_64-unknown-linux-musl-gcc',
			},
		});
		const copyInstructions = copyDestinations[arch];
		copyFileSync(copyInstructions.from, copyInstructions.to);
	}
} else {
	console.log('Environment has no cargo. Skipping Rust builds.');
}
