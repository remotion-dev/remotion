import {execSync} from 'node:child_process';
import {existsSync, mkdirSync, unlinkSync} from 'node:fs';
import {toolchains} from './toolchains';

const unpatched = [
	'x86_64-apple-darwin',
	'aarch64-apple-darwin',
	'x86_64-pc-windows-gnu',
];

for (const toolchain of toolchains) {
	process.stdout.write(toolchain + '...');

	execSync(
		`curl https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/${toolchain}.zip -o ${toolchain}.zip`,
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
