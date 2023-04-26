import {execSync} from 'child_process';
import {cpSync, existsSync, mkdirSync, unlinkSync} from 'fs';

const toolchains = [
	'x86_64_gnu_toolchain',
	'x86_64_musl_toolchain',
	'aarch64_musl_toolchain',
	'aarch64_gnu_toolchain',
];

const unpatched = [
	'x86_64-apple-darwin',
	'aarch64-apple-darwin',
	'x86_64-pc-windows-gnu',
];

for (const toolchain of toolchains) {
	process.stdout.write(toolchain + '...');

	execSync(
		`curl https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/${toolchain}.zip -o ${toolchain}.zip`
	);

	if (!existsSync('toolchains')) {
		mkdirSync('toolchains');
	}

	if (!existsSync('toolchains/' + toolchain)) {
		mkdirSync('toolchains/' + toolchain);
	}

	execSync(`tar -xzf ../../${toolchain}.zip`, {
		cwd: `toolchains/${toolchain}`,
	});

	unlinkSync(`${toolchain}.zip`);
	process.stdout.write('Done.\n');
}

for (const target of unpatched) {
	execSync(`rustup target add ${target}`);
}

// Aarch64 sysroot is missing libz.so.1
cpSync(
	'libz.so.1',
	'/opt/homebrew/Cellar/aarch64-unknown-linux-gnu/0.1.0/aarch64-unknown-linux-gnu/sysroot/lib64/libz.so.1'
);
