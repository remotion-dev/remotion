import {execSync} from 'child_process';
import os from 'os';

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

if (hasCargo()) {
	const archs = process.argv.includes('--all') ? targets : [getTarget()];
	for (const arch of archs) {
		const command = `cargo build --release --target=${arch}`;
		console.log(command);
		execSync(command, {
			stdio: 'inherit',
			env: {
				...process.env,
				CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER:
					'aarch64-unknown-linux-gnu-gcc',
				CARGO_TARGET_AARCH64_UNKNOWN_LINUX_MUSL_LINKER:
					'aarch64-unknown-linux-gnu-gcc',
				CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_LINKER:
					'x86_64-unknown-linux-gnu-gcc',
				CARGO_TARGET_X86_64_UNKNOWN_LINUX_MUSL_LINKER:
					'x86_64-unknown-linux-musl-gcc',
			},
		});
	}
} else {
	console.log('Environment has no cargo. Skipping Rust builds.');
}
