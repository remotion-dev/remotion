import {execSync} from 'child_process';
import {
	copyFileSync,
	rmSync,
	readdirSync,
	renameSync,
	unlinkSync,
	existsSync,
} from 'fs';
import path from 'path';
import {PREFIX} from './const.mjs';

const isWindows = process.argv[2] === 'windows';
const remotionLibDir = path.join(process.cwd(), 'remotion', 'lib');
const remotionLib64Dir = path.join(process.cwd(), 'remotion', 'lib64');
const remotionBinDir = path.join(process.cwd(), 'remotion', 'bin');

const getStripTool = () => {
	const candidates = isWindows
		? ['x86_64-w64-mingw32-strip']
		: process.platform === 'darwin'
			? ['strip', 'llvm-strip']
			: ['strip', 'llvm-strip'];

	for (const tool of candidates) {
		try {
			execSync(`command -v ${tool}`, {
				stdio: 'ignore',
			});
			return tool;
		} catch {
			// Continue trying alternatives.
		}
	}

	return null;
};

const stripFilesInDir = (dir, shouldStrip, stripTool, stripArgs) => {
	if (!existsSync(dir)) {
		return;
	}

	const files = readdirSync(dir, {
		withFileTypes: true,
	});

	for (const file of files) {
		if (!file.isFile()) {
			continue;
		}

		if (!shouldStrip(file.name)) {
			continue;
		}

		const fullPath = path.join(dir, file.name);
		try {
			execSync(
				[stripTool, ...stripArgs, `"${fullPath.replaceAll('"', '\\"')}"`].join(
					' ',
				),
				{
					stdio: 'inherit',
				},
			);
		} catch (err) {
			console.warn(`Skipping strip for ${fullPath}:`, err.message);
		}
	}
};

const removeDevArtifacts = () => {
	const devPaths = [
		path.join(remotionLibDir, 'pkgconfig'),
		path.join(remotionLib64Dir, 'pkgconfig'),
		path.join(remotionLibDir, 'cmake'),
		path.join(remotionLib64Dir, 'cmake'),
	];

	for (const devPath of devPaths) {
		if (existsSync(devPath)) {
			rmSync(devPath, {
				force: true,
				recursive: true,
			});
		}
	}

	for (const libDir of [remotionLibDir, remotionLib64Dir]) {
		if (!existsSync(libDir)) {
			continue;
		}

		const files = readdirSync(libDir, {
			withFileTypes: true,
		});
		for (const file of files) {
			if (!file.isFile()) {
				continue;
			}
			if (file.name.endsWith('.a') || file.name.endsWith('.la')) {
				rmSync(path.join(libDir, file.name), {
					force: true,
				});
			}
		}
	}
};

if (isWindows) {
	copyFileSync(
		'libwinpthread-1.dll',
		path.join(remotionLibDir, 'libwinpthread-1.dll'),
	);
	copyFileSync('libvpx-1.dll', path.join(remotionLibDir, 'libvpx-1.dll'));
	copyFileSync('zlib1.dll', path.join(remotionLibDir, 'zlib1.dll'));
	copyFileSync('libssp-0.dll', path.join(remotionLibDir, 'libssp-0.dll'));
	copyFileSync('libstdc++-6.dll', path.join(remotionLibDir, 'libstdc++-6.dll'));
	copyFileSync('msvcr100.dll', path.join(remotionLibDir, 'msvcr100.dll'));
	copyFileSync(
		'libgcc_s_seh-1.dll',
		path.join(remotionLibDir, 'libgcc_s_seh-1.dll'),
	);
	const binFiles = readdirSync(remotionBinDir);
	for (const file of binFiles) {
		if (file.endsWith('.lib')) {
			const oldPath = path.join(remotionBinDir, file);
			unlinkSync(oldPath);
		} else if (file.endsWith('.dll')) {
			const oldPath = path.join(remotionBinDir, file);
			const newPath = path.join(remotionBinDir, '..', 'lib', file);

			console.log(oldPath, newPath);
			renameSync(oldPath, newPath);
		}
	}

	const libFiles = readdirSync(remotionLibDir);
	for (const file of libFiles) {
		if (file.endsWith('.def')) {
			unlinkSync(path.join(remotionLibDir, file));
		}
	}
}

const stripTool = getStripTool();
if (stripTool) {
	const stripArgs =
		process.platform === 'darwin' ? ['-x'] : ['--strip-unneeded'];
	stripFilesInDir(
		remotionBinDir,
		(fileName) => (isWindows ? fileName.endsWith('.exe') : true),
		stripTool,
		stripArgs,
	);
	stripFilesInDir(
		remotionLibDir,
		(fileName) =>
			isWindows
				? fileName.endsWith('.dll')
				: fileName.endsWith('.dylib') || fileName.includes('.so'),
		stripTool,
		stripArgs,
	);
	stripFilesInDir(
		remotionLib64Dir,
		(fileName) => fileName.endsWith('.dylib') || fileName.includes('.so'),
		stripTool,
		stripArgs,
	);
}

removeDevArtifacts();

execSync(`tar cvzf ffmpeg.tar.gz ${PREFIX} bindings.rs`, {
	stdio: 'inherit',
});
