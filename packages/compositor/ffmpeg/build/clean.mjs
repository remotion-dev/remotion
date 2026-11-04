import {existsSync, lstat, lstatSync, rmdirSync, rmSync, unlinkSync} from 'fs';
import path from 'path';

const paths = [
	path.join(process.cwd(), 'remotion'),
	path.join(process.cwd(), 'ffmpeg'),
	path.join(process.cwd(), 'target'),
	path.join(process.cwd(), 'x264'),
	path.join(process.cwd(), 'x265'),
	path.join(process.cwd(), 'av1'),
	path.join(process.cwd(), 'aom'),
	path.join(process.cwd(), 'aom-build'),
	path.join(process.cwd(), 'zimg'),
	path.join(process.cwd(), 'opus'),
	path.join(process.cwd(), 'libmp3lame'),
	path.join(process.cwd(), 'libvpx-1.12.0'),
	path.join(process.cwd(), 'opus-1.3.1'),
	path.join(process.cwd(), 'fdk-aac-free-2.0.0'),
	path.join(process.cwd(), 'fdk-aac-2.0.2'),
	path.join(process.cwd(), 'nv-codec-headers'),
	path.join(process.cwd(), 'bindings.rs'),
	path.join(process.cwd(), 'ffmpeg.tar.gz'),
	path.join(process.cwd(), 'out-test.mp4'),
	path.join(process.cwd(), 'out-test.webm'),
	path.join(process.cwd(), 'out-test.png'),
];

for (const path of paths) {
	if (existsSync(path)) {
		rmSync(path, {recursive: true});
	}
}
