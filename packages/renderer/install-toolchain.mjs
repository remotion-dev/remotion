import {execSync} from 'child_process';
import {existsSync, mkdirSync, unlinkSync, writeFileSync} from 'fs';

const toolchains = [
	'x86_64_gnu_toolchain',
	'aarch_gnu_toolchain',
	'x86_64_musl_toolchain',
	'aarch64-musl-toolchain'
];

for (const toolchain of toolchains) {
	const res = await fetch(
		`https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/${toolchain}.zip`
	);

	const blob = await res.arrayBuffer();

	writeFileSync(`${toolchain}.zip`, Buffer.from(blob));

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
}
