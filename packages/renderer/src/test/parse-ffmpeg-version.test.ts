import {expect, test} from 'vitest';
import {parseFfmpegVersion} from '../ffmpeg-flags';

test('Should parse a normal FFFMPEG version', () => {
	const buildconf = `
  ffmpeg version 4.3.1 Copyright (c) 2000-2020 the FFmpeg developers
    built with Apple clang version 12.0.0 (clang-1200.0.32.28)
    configuration: --prefix=/usr/local/Cellar/ffmpeg/4.3.1_9 --enable-shared --enable-pthreads --enable-version3 --enable-avresample --cc=clang --host-cflags= --host-ldflags= --enable-ffplay --enable-gnutls --enable-gpl --enable-libaom --enable-libbluray --enable-libdav1d --enable-libmp3lame --enable-libopus --enable-librav1e --enable-librubberband --enable-libsnappy --enable-libsrt --enable-libtesseract --enable-libtheora --enable-libvidstab --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxml2 --enable-libxvid --enable-lzma --enable-libfontconfig --enable-libfreetype --enable-frei0r --enable-libass --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-libopenjpeg --enable-librtmp --enable-libspeex --enable-libsoxr --enable-videotoolbox --enable-libzmq --enable-libzimg --disable-libjack --disable-indev=jack
  `;
	expect(parseFfmpegVersion(buildconf)).toEqual([4, 3, 1]);
});

test('Should return null if running a git version', () => {
	const buildconf = `
    ffmpeg -version 
    ffmpeg version git-2020-08-31-4a11a6f Copyright (c) 2000-2020 the FFmpeg developers
    built with gcc 10.2.1 (GCC) 20200805
    configuration: --enable-gpl --enable-version3 --enable-sdl2 --enable-fontconfig --enable-gnutls --enable-iconv --enable-libass --enable-libdav1d --enable-libbluray --enable-libfreetype --enable-libmp3lame --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-libopenjpeg --enable-libopus --enable-libshine --enable-libsnappy --enable-libsoxr 
    --enable-libsrt --enable-libtheora --enable-libtwolame --enable-libvpx --enable-libwavpack --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxml2 --enable-libzimg --enable-lzma --enable-zlib --enable-gmp --enable-libvidstab --enable-libvmaf --enable-libvorbis --enable-libvo-amrwbenc --enable-libmysofa --enable-libspeex --enable-libxvid 
    --enable-libaom --enable-libgsm --enable-librav1e --enable-libsvtav1 --disable-w32threads --enable-libmfx --enable-ffnvcodec --enable-cuda-llvm --enable-cuvid --enable-d3d11va --enable-nvenc --enable-nvdec --enable-dxva2 --enable-avisynth --enable-libopenmpt --enable-amf
  `;
	expect(parseFfmpegVersion(buildconf)).toEqual(null);
});
