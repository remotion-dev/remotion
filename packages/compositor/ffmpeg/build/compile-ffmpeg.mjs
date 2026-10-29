import {execFileSync, execSync} from 'child_process';
import fs, {existsSync} from 'fs';
import path from 'path';
import {enableAv1} from './compile-av1.mjs';
import {enableFdkAac} from './compile-fdkaac.mjs';
import {enableLibMp3Lame} from './compile-libmp3lame.mjs';
import {enableNvencHeaders} from './compile-nvenc.mjs';
import {enableOpus} from './compile-opus.mjs';
import {enableVpx} from './compile-vpx.mjs';
import {enableX264} from './compile-x264.mjs';
import {enableX265} from './compile-x265.mjs';
import {enableZimg} from './compile-zimg.mjs';
import {MACOS_DEPLOYMENT_TARGET, PREFIX} from './const.mjs';
import {fixMacOsLinks} from './fix-links.mjs';
import {fixLinuxLinks} from './fix-linux-links.mjs';
import {verifyMacOSDeploymentTarget} from './verify-macos-deployment-target.mjs';

const macOsDeploymentFlag = `-mmacosx-version-min=${MACOS_DEPLOYMENT_TARGET}`;

if (process.platform === 'darwin') {
	process.env.MACOSX_DEPLOYMENT_TARGET = MACOS_DEPLOYMENT_TARGET;
	for (const variable of ['CFLAGS', 'CXXFLAGS', 'LDFLAGS']) {
		const current = process.env[variable] ?? '';
		process.env[variable] = current
			.split(/\s+/)
			.filter(Boolean)
			.includes(macOsDeploymentFlag)
			? current
			: [current, macOsDeploymentFlag].filter(Boolean).join(' ');
	}

	console.log(
		`Building all macOS objects for macOS ${MACOS_DEPLOYMENT_TARGET} or later`,
	);

	for (const directory of [
		'fdk-aac-free-2.0.0',
		'zimg',
		'libvpx-1.12.0',
		'x264',
		'x265',
		'libmp3lame',
		'opus-1.3.1',
	]) {
		if (existsSync(path.join(directory, 'Makefile'))) {
			execSync('make clean', {cwd: directory, stdio: 'inherit'});
		}
	}

	for (const buildOutput of [
		PREFIX,
		'fdk-aac-free-2.0.0/remotion',
		'av1/build',
		'aom-build',
		'aom/remotion',
		'zimg/remotion',
		'libvpx-1.12.0/remotion',
		'x264/remotion',
		'x265/remotion',
		'libmp3lame/remotion',
		'opus-1.3.1/remotion',
		'ffmpeg/remotion',
	]) {
		fs.rmSync(buildOutput, {force: true, recursive: true});
	}
}

if (existsSync('/opt/homebrew/opt/libx11/lib/libX11.6.dylib')) {
	console.log(
		'/opt/homebrew/opt/libx11/lib/libX11.6.dylib exists. Check that there is no dependency for libavcodec.dylib that requires it! Not all macOS systems have this library.',
	);
	process.exit(1);
}

if (existsSync('/opt/homebrew/opt/sdl2/lib/libSDL2-2.0.0.dylib')) {
	console.log(
		'/opt/homebrew/opt/sdl2/lib/libSDL2-2.0.0.dylib exists. Check that there is no dependency for libavcodec.dylib that requires it! Not all macOS systems have this library.',
	);
	process.exit(1);
}

const isWindows = process.argv.includes('windows');
const isMusl = process.argv.includes('musl');
const isOldCmake = process.argv.includes('old-cmake');
const shouldEnableRemotionShm =
	!isWindows && ['darwin', 'linux'].includes(process.platform);

const decoders = [
	'aac',
	'ac3',
	'flac',
	'h264',
	'hevc',
	'libvpx_vp8',
	'libvpx_vp9',
	'vp8',
	'vp9',
	'mp3',
	'mpeg4',
	'opus',
	'pcm_u8',
	'pcm_f16le',
	'pcm_f24le',
	'pcm_f32le',
	'pcm_f32be',
	'pcm_f64le',
	'pcm_f64be',
	'pcm_s16be',
	'pcm_s16le',
	'pcm_s24be',
	'pcm_s24le',
	'pcm_s32be',
	'pcm_s32le',
	'pcm_s64be',
	'pcm_s64le',
	'pcm_u16be',
	'pcm_u16le',
	'pcm_u24le',
	'pcm_u24be',
	'pcm_u32be',
	'pcm_u32le',
	'prores',
	'theora',
	'vorbis',
	'vp9',
	'mjpeg',
	'gif',
	'png',
	'libdav1d',
	'hls',
	'm4a',
	'rawvideo',
	shouldEnableRemotionShm ? 'wrapped_avframe' : null,
	process.platform === 'darwin' ? 'h264_videotoolbox' : null,
	process.platform === 'darwin' ? 'hevc_videotoolbox' : null,
].filter(Boolean);

const demuxers = [
	'aac',
	'av1',
	'avi',
	'caf',
	'concat',
	'flac',
	'flv',
	'h264',
	'hevc',
	'image2',
	'image2pipe',
	'matroska',
	'mov',
	'mp3',
	'ogg',
	'pcm_f32le',
	'pcm_f32be',
	'pcm_f64le',
	'pcm_f64be',
	'pcm_s16be',
	'pcm_s16le',
	'pcm_s24be',
	'pcm_s24le',
	'pcm_s32be',
	'pcm_s32le',
	'pcm_u16be',
	'pcm_u16le',
	'pcm_u24le',
	'pcm_u24be',
	'pcm_u32be',
	'pcm_u32le',
	'wav',
	'gif',
	'hls',
	'm4a',
	'mpeg2_videotoolbox',
	'mpeg4_videotoolbox',
];

if (!existsSync(PREFIX)) {
	fs.mkdirSync(PREFIX);
}

const isLambdaTarget =
	process.platform === 'linux' &&
	process.arch === 'arm64' &&
	!isMusl &&
	!isWindows;
const shouldEnableAv1Encoder = !isLambdaTarget;
const shouldEnableNvenc =
	process.platform === 'linux' && (isWindows || process.arch !== 'arm64');

await enableFdkAac(isWindows);
enableAv1({isWindows, enableEncoder: shouldEnableAv1Encoder});
enableZimg(isWindows);
enableVpx(isWindows);
enableX264(isMusl, isWindows);
enableX265(isMusl, isWindows, isOldCmake);
enableLibMp3Lame(isWindows);
enableOpus(isWindows);
enableNvencHeaders(shouldEnableNvenc);

const TAG = 'n7.1';

if (fs.existsSync('ffmpeg')) {
	execSync('git stash --include-untracked', {
		stdio: 'inherit',
		cwd: 'ffmpeg',
	});
	execSync('git checkout master', {
		cwd: 'ffmpeg',
		stdio: 'inherit',
	});
	execSync('git pull', {
		cwd: 'ffmpeg',
		stdio: 'inherit',
	});
	execSync(`git checkout ${TAG}`, {
		cwd: 'ffmpeg',
		stdio: 'inherit',
	});
} else {
	execSync('git clone https://github.com/ffmpeg/ffmpeg.git', {
		stdio: 'inherit',
	});
	execSync(`git checkout ${TAG}`, {
		cwd: 'ffmpeg',
		stdio: 'inherit',
	});
}

for (const patch of [
	'aac.patch',
	'hevc_ps.patch',
	'x265-api.patch',
	'fdk-aac-free.patch',
	'remotion-shm-input.patch',
]) {
	execFileSync('git', ['apply', path.resolve(patch)], {
		cwd: 'ffmpeg',
		stdio: 'inherit',
	});
}

const extraCFlags = [
	// TODO: should it always be static libgcc?
	isMusl ? '-static-libgcc' : null,
	process.platform === 'darwin' ? macOsDeploymentFlag : null,
	'-I' + PREFIX + '/include',
	'-I' + PREFIX + '/include/opus',
	'-I' + PREFIX + '/include/lame',
	'-I' + PREFIX + '/include/vpx',
].filter(Boolean);

const extraLdFlags = [
	'-L' + PREFIX + '/lib',
	process.platform === 'darwin' ? macOsDeploymentFlag : null,
	process.platform === 'darwin' && process.arch === 'arm64' ? '-Wl' : null,
].filter(Boolean);

execSync('cp -r remotion ffmpeg', {stdio: 'inherit'});

const pkgConfigDirs = [
	path.join(process.cwd(), PREFIX, 'lib', 'pkgconfig'),
	path.join(process.cwd(), PREFIX, 'lib64', 'pkgconfig'),
];

execSync(
	[
		path.posix.join(process.cwd().replace(/\\/g, '/'), 'ffmpeg', 'configure'),
		`--prefix=${PREFIX}`,
		isWindows
			? '--target-os=mingw32 --arch=x86_64 --cross-prefix=x86_64-w64-mingw32-'
			: null,
		isWindows ? '--disable-w32threads' : null,
		isWindows ? '--disable-os2threads' : null,
		'--extra-cflags="' + extraCFlags.join(' ') + '"',
		'--extra-ldflags="' + extraLdFlags.join(' ') + '"',
		isMusl ? '--extra-cxxflags="-static-libgcc -static-libstdc++"' : null,
		isMusl ? '--extra-ldexeflags="-static-libgcc -static-libstdc++"' : null,
		'--enable-small',
		'--enable-shared',
		'--enable-libdav1d',
		shouldEnableAv1Encoder ? '--enable-libaom' : null,
		'--enable-libzimg',
		'--enable-libfdk-aac',
		'--disable-static',
		'--disable-ffplay',
		'--disable-postproc',
		'--disable-filters',
		'--disable-libxcb',
		'--enable-filter=aformat',
		'--enable-filter=atrim',
		'--enable-filter=acopy',
		'--enable-filter=adelay',
		'--enable-filter=anullsrc',
		'--enable-filter=atempo',
		'--enable-filter=apad',
		'--enable-filter=amerge',
		'--enable-filter=amix',
		'--enable-filter=asetrate',
		'--enable-filter=asetpts',
		'--enable-filter=aresample',
		'--enable-filter=concat',
		'--enable-filter=loudnorm',
		'--enable-filter=colorspace',
		'--enable-filter=tinterlace',
		'--enable-filter=fieldorder',
		'--enable-filter=pan',
		'--enable-filter=volume',
		'--enable-filter=scale',
		'--enable-filter=sine',
		'--enable-filter=split',
		'--enable-filter=nullsrc',
		'--enable-filter=silencedetect',
		'--enable-filter=palettegen',
		'--enable-filter=paletteuse',
		'--enable-filter=zscale',
		'--enable-filter=tonemap',
		'--enable-filter=copy',
		'--disable-doc',
		'--disable-debug',
		'--enable-gpl',
		'--disable-encoders',
		'--enable-encoder=opus',
		'--enable-encoder=aac',
		'--enable-encoder=libfdk_aac',
		'--enable-encoder=png',
		'--enable-encoder=mjpeg',
		'--enable-encoder=pcm_s16le',
		'--enable-encoder=pcm_s24le',
		'--enable-encoder=libx264',
		'--enable-encoder=libx265',
		shouldEnableAv1Encoder ? '--enable-encoder=libaom_av1' : null,
		'--enable-libvpx',
		'--enable-encoder=libvpx_vp8',
		'--enable-encoder=libvpx_vp9',
		'--enable-encoder=gif',
		'--enable-encoder=libmp3lame',
		'--enable-encoder=libopus',
		'--enable-encoder=prores_ks',
		'--enable-encoder=rawvideo',
		process.platform === 'darwin' ? '--enable-videotoolbox' : null,
		process.platform === 'darwin' ? '--enable-encoder=h264_videotoolbox' : null,
		process.platform === 'darwin' ? '--enable-encoder=hevc_videotoolbox' : null,
		process.platform === 'darwin'
			? '--enable-encoder=prores_videotoolbox'
			: null,
		shouldEnableNvenc ? '--enable-encoder=h264_nvenc' : null,
		shouldEnableNvenc ? '--enable-encoder=hevc_nvenc' : null,
		'--disable-muxers',
		'--enable-muxer=webm,opus,mp4,wav,mp3,mov,matroska,hevc,h264,gif,image2,image2pipe,adts,m4a,mpegts,null,avi',
		'--enable-libx264',
		'--enable-libx265',
		'--enable-libmp3lame',
		'--enable-zlib',
		'--enable-libopus',
		'--disable-demuxers',
		'--disable-sdl2',
		'--disable-xlib',
		shouldEnableRemotionShm ? '--enable-indev=remotionshm' : null,
		`--enable-demuxer=${demuxers.map((d) => d).join(',')}`,
		'--disable-decoders',
		`--enable-decoder=${decoders.map((d) => d).join(',')}`,
	]
		.filter(Boolean)
		.join(' '),
	{
		env: {
			...process.env,
			PKG_CONFIG_PATH: pkgConfigDirs.join(path.delimiter),
		},
		cwd: 'ffmpeg',
		stdio: 'inherit',
	},
);

execSync('make clean', {
	cwd: 'ffmpeg',
	stdio: 'inherit',
});

const sedPrefix = process.platform === 'darwin' ? "sed -i ''" : 'sed -i';

// Disable generations of symlinks
execSync(
	sedPrefix +
		` 's/^\\(SLIBNAME_WITH_VERSION=\\$(SLIBNAME)\\)\\.\\$(LIBVERSION)$/\\1/' ffbuild/config.mak`,
	{
		cwd: 'ffmpeg',
		stdio: 'inherit',
	},
);
// Linux
execSync(
	sedPrefix +
		" 's/SLIBNAME_WITH_MAJOR=$(SLIBNAME).$(LIBMAJOR)/SLIBNAME_WITH_MAJOR=$(SLIBNAME)/' ffbuild/config.mak",
	{
		cwd: 'ffmpeg',
		stdio: 'inherit',
	},
);
// macOS
if (process.platform === 'darwin') {
	execSync(
		sedPrefix +
			" 's/SLIBNAME_WITH_MAJOR=$(SLIBPREF)$(FULLNAME).$(LIBMAJOR)$(SLIBSUF)/SLIBNAME_WITH_MAJOR=$(SLIBPREF)$(FULLNAME)$(SLIBSUF)/' ffbuild/config.mak",
		{
			cwd: 'ffmpeg',
			stdio: 'inherit',
		},
	);
}

execSync(
	sedPrefix +
		" 's/SLIB_INSTALL_NAME=$(SLIBNAME_WITH_VERSION)/SLIB_INSTALL_NAME=$(SLIBNAME)/' ffbuild/config.mak",
	{
		cwd: 'ffmpeg',
		stdio: 'inherit',
	},
);
execSync(
	sedPrefix +
		" 's/SLIB_INSTALL_LINKS=$(SLIBNAME_WITH_MAJOR) $(SLIBNAME)/SLIB_INSTALL_LINKS=/' ffbuild/config.mak",
	{
		cwd: 'ffmpeg',
		stdio: 'inherit',
	},
);

execSync('make', {
	cwd: 'ffmpeg',
	stdio: 'inherit',
});

execSync('make install', {
	cwd: 'ffmpeg',
	stdio: 'inherit',
});

execSync('rm -rf ' + PREFIX + '/share', {
	cwd: 'ffmpeg',
	stdio: 'inherit',
});

if (process.platform === 'darwin') {
	fixMacOsLinks();
} else if (!isWindows) {
	fixLinuxLinks();
}
execSync('cp -r ' + PREFIX + ' ../', {
	cwd: 'ffmpeg',
	stdio: 'inherit',
});

verifyMacOSDeploymentTarget();
