import {execSync} from 'child_process';
import {existsSync, mkdirSync, unlinkSync, writeFileSync} from 'fs';

const res = await fetch(
	'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/x86_64_gnu_toolchain.zip'
);

const blob = await res.arrayBuffer();

writeFileSync('x86_64_gnu_toolchain.zip', Buffer.from(blob));

if (!existsSync('toolchains')) {
	mkdirSync('toolchains');
}

if (!existsSync('toolchains/x86_64-unknown-linux-gnu')) {
	mkdirSync('toolchains/x86_64-unknown-linux-gnu');
}

execSync('tar -xzf ../../x86_64_gnu_toolchain.zip', {
	cwd: 'toolchains/x86_64-unknown-linux-gnu',
});

unlinkSync('x86_64_gnu_toolchain.zip');
