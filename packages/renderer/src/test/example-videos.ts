import path from 'node:path';

const examplePackage = path.join(__dirname, '..', '..', '..', 'example');
const docsPackage = path.join(__dirname, '..', '..', '..', 'docs');

export const exampleVideos = {
	bigBuckBunny: path.join(examplePackage, 'public/bigbuckbunny.mp4'),
	transparentWebm: path.join(docsPackage, '/static/img/transparent-video.webm'),
	framerWithoutFileExtension: path.join(
		examplePackage,
		'public',
		'framermp4withoutfileextension'
	),
	corrupted: path.join(examplePackage, 'public', 'corrupted.mp4'),
	customDar: path.join(examplePackage, 'public', 'custom-dar.mp4'),
	screenrecording: path.join(examplePackage, 'public', 'quick.mov'),
	nofps: path.join(examplePackage, 'public', 'nofps.webm'),
	webcam: path.join(examplePackage, 'public', 'webcam.webm'),
};
