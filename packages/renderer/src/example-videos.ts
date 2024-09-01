import path from 'node:path';

const examplePackage = path.join(__dirname, '..', '..', 'example');
const docsPackage = path.join(__dirname, '..', '..', 'docs');

export const exampleVideos = {
	bigBuckBunny: path.join(examplePackage, 'public/bigbuckbunny.mp4'),
	transparentWebm: path.join(docsPackage, '/static/img/transparent-video.webm'),
	framerWithoutFileExtension: path.join(
		examplePackage,
		'public',
		'framermp4withoutfileextension',
	),
	corrupted: path.join(examplePackage, 'public', 'corrupted.mp4'),
	customDar: path.join(examplePackage, 'public', 'custom-dar.mp4'),
	screenrecording: path.join(examplePackage, 'public', 'quick.mov'),
	nofps: path.join(examplePackage, 'public', 'nofps.webm'),
	variablefps: path.join(examplePackage, 'public', 'variablefps.webm'),
	zerotimestamp: path.join(examplePackage, 'public', 'zero-timestamp.mp4'),
	webcam: path.join(examplePackage, 'public', 'webcam.webm'),
	iphonevideo: path.join(examplePackage, 'public', 'iphonevideo.mov'),
	av1: path.join(examplePackage, 'public', 'av1.webm'),
	framer24fps: path.join(
		examplePackage,
		'src',
		'resources',
		'framer-24fps.mp4',
	),
	music: path.join(examplePackage, 'public', 'music.mp3'),
	notavideo: path.join(examplePackage, 'public', 'giphy.gif'),
	notafile: path.join(examplePackage, 'public', 'doesnotexist'),
	transparentwithdar: path.join(
		examplePackage,
		'public',
		'transparent-with-dar.webm',
	),
	prores: path.join(examplePackage, 'public', 'prores.mov'),
	iphonehevc: path.join(examplePackage, 'public', 'iphone-hevc.mov'),
	matroskaPcm16: path.join(examplePackage, 'public', 'matroska-pcm16.mkv'),
	mp4withmp3: path.join(examplePackage, 'public', 'mp4-mp3.mp4'),
	av1bbb: path.join(examplePackage, 'public', 'av1-bbb.webm'),
	av1mp4: path.join(examplePackage, 'public', 'av1-bbb.mp4'),
	av1mp4WithColr: path.join(examplePackage, 'public', 'av1.mp4'),
	vp8Vorbis: path.join(examplePackage, 'public', 'vp8-vorbis.webm'),
	vp9: path.join(examplePackage, 'public', 'vp9.webm'),
	stretchedVp8: path.join(examplePackage, 'public', 'stretched-vp8.webm'),
	matroskaMp3: path.join(examplePackage, 'public', 'matroska-mp3.mkv'),
	matroskaH265Aac: path.join(examplePackage, 'public', 'matroska-h265-aac.mkv'),
	opusWebm: path.join(examplePackage, 'public', 'opus.webm'),
	avi: path.join(examplePackage, 'public', 'example.avi'),
};
