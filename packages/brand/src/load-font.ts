import {continueRender, delayRender, staticFile} from 'remotion';

const loaded = false;

export const loadFont = async () => {
	if (loaded) {
		return;
	}
	const handle = delayRender();
	const face = new FontFace(
		'Variable',
		`url(${staticFile('variable.woff2')}) format('woff2')`
	);

	await face.load();
	(document.fonts as any).add(face);
	continueRender(handle);
};
