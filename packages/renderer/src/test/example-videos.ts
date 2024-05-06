import path from 'node:path';

const examplePackage = path.join(__dirname, '..', '..', '..', 'example');
const docsPackage = path.join(__dirname, '..', '..', '..', 'docs');

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
	iphonehevc: path.join(examplePackage, 'public', 'iphone-hevc.mov'),
};
