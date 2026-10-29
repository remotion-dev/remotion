import assert from 'assert';
import {execSync, spawnSync} from 'child_process';
import path from 'path';
import {verifyMacOSDeploymentTarget} from './verify-macos-deployment-target.mjs';

verifyMacOSDeploymentTarget();

const lib = path.join(process.cwd(), 'remotion', 'lib');

const env =
	process.platform === 'darwin'
		? {
				...process.env,
				DYLD_LIBRARY_PATH: lib,
			}
		: process.platform === 'win32'
			? {
					...process.env,
					PATH: `${process.env.PATH};${lib}`,
				}
			: {
					...process.env,
					LD_LIBRARY_PATH: lib,
				};

const ffmpegBinary = path.join(process.cwd(), 'remotion', 'bin', 'ffmpeg');
const shouldHaveAv1Encoder = process.env.EXPECT_AV1_ENCODER !== '0';

const exit1 = spawnSync(ffmpegBinary, ['-buildconf'], {
	env,
});
if (exit1.status !== 0) {
	console.log(exit1.stderr.toString('utf8'));
	console.log(exit1.stdout.toString('utf8'));
}
assert(exit1.status === 0);

const devices = spawnSync(ffmpegBinary, ['-hide_banner', '-devices'], {
	env,
});
if (devices.status !== 0) {
	console.log(devices.stderr.toString('utf8'));
	console.log(devices.stdout.toString('utf8'));
}
assert(devices.status === 0);
assert.equal(
	devices.stdout.toString('utf8').includes('remotionshm'),
	process.platform !== 'win32',
);

const encoders = spawnSync(ffmpegBinary, ['-hide_banner', '-encoders'], {
	env,
});
if (encoders.status !== 0) {
	console.log(encoders.stderr.toString('utf8'));
	console.log(encoders.stdout.toString('utf8'));
}
assert(encoders.status === 0);
assert(
	encoders.stdout.toString('utf8').includes('libaom-av1') ===
		shouldHaveAv1Encoder,
);

const exit2 = spawnSync(
	ffmpegBinary,
	['-i', 'sample-5s.webm', '-t', '1', 'out-test.mp4', '-y'],
	{
		env,
	},
);
assert(exit2.status === 0);

const exit3 = spawnSync(
	ffmpegBinary,
	[
		'-i',
		'sample.mp4',
		'-t',
		'1',
		'-c:v',
		'libvpx',
		'-c:a',
		'libopus',
		'out-test.webm',
		'-y',
	],
	{
		env,
		stdio: 'inherit',
	},
);
assert(exit3.status === 0);

const exit4 = spawnSync(
	ffmpegBinary,
	[
		'-i',
		'sample.mp4',
		'-f',
		'image2',
		'-frames:v',
		'1',
		'-vcodec',
		'png',
		'out-test.png',
		'-y',
	],
	{
		env,
	},
);
assert(exit4.status === 0);

const exit5 = spawnSync(
	ffmpegBinary,
	[
		'-i',
		'sample.mp4',
		'-f',
		'image2',
		'-frames:v',
		'1',
		'-vcodec',
		'mjpeg',
		'out-test.png',
		'-y',
	],
	{
		env,
	},
);
assert(exit5.status === 0);

const exit_x265 = spawnSync(
	ffmpegBinary,
	['-i', 'sample.mp4', '-t', '1', '-c:v', 'libx265', 'out-test-x265.mp4', '-y'],
	{
		env,
		stdio: 'inherit',
	},
);
if (exit_x265.status !== 0) {
	console.log(
		'x265 encoding test failed with status',
		exit_x265.status,
		'signal',
		exit_x265.signal,
	);
}
assert(exit_x265.status === 0);

const exit6 = spawnSync(
	ffmpegBinary,
	[
		'-i',
		'sample-av1.webm',
		'-f',
		'image2',
		'-frames:v',
		'1',
		'-vcodec',
		'mjpeg',
		'out-test-av1.png',
		'-y',
	],
	{
		env,
		stdio: 'inherit',
	},
);
assert(exit6.status === 0);

if (shouldHaveAv1Encoder) {
	const exit7 = spawnSync(
		ffmpegBinary,
		[
			'-i',
			'sample.mp4',
			'-frames:v',
			'1',
			'-an',
			'-c:v',
			'libaom-av1',
			'out-test-libaom-av1.mkv',
			'-y',
		],
		{
			env,
			stdio: 'inherit',
		},
	);
	assert(exit7.status === 0);
}

if (process.platform !== 'win32') {
	const python = ['python3', 'python3.8'].find((candidate) => {
		const check = spawnSync(
			candidate,
			['-c', 'from multiprocessing import resource_tracker, shared_memory'],
			{env, stdio: 'ignore'},
		);
		return check.status === 0;
	});
	if (python) {
		const sharedMemoryTest = spawnSync(python, ['test-remotion-shm.py'], {
			env,
			stdio: 'inherit',
		});
		assert(sharedMemoryTest.status === 0);
	} else if (
		spawnSync('python3', ['--version'], {env, stdio: 'ignore'}).status === 0
	) {
		throw new Error(
			'Shared-memory integration test requires Python 3.8+ with multiprocessing.shared_memory',
		);
	} else {
		console.log(
			'Skipping shared-memory integration test: Python with multiprocessing.shared_memory is unavailable',
		);
	}
}
console.log('Hooray!');
