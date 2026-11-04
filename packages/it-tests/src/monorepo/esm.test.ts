import {expect, test} from 'bun:test';
import {execSync} from 'child_process';

test('Should be able to "import" frontend in node', async () => {
	execSync(
		`node --input-type=module -e "import {TransitionSeries} from '@remotion/transitions'; console.log(TransitionSeries)"`,
	);
	execSync(
		`node --input-type=module -e "import {Player} from '@remotion/player'; console.log(Player)"`,
	);
	execSync(
		`node --input-type=module -e "import {preloadAudio} from '@remotion/preload'; console.log(preloadAudio)"`,
	);
	execSync(
		`node --input-type=module -e "import {Rect} from '@remotion/shapes'; console.log(Rect)"`,
	);
	execSync(
		`node --input-type=module -e "import {zColor} from '@remotion/zod-types'; console.log(zColor)"`,
	);
	execSync(
		`node --input-type=module -e "import {noise2D} from '@remotion/noise'; console.log(noise2D)"`,
	);
	execSync(
		`node --input-type=module -e "import {CameraMotionBlur} from '@remotion/motion-blur'; console.log(CameraMotionBlur)"`,
	);
	execSync(
		`node --input-type=module -e "import {getVideoMetadata} from '@remotion/media-utils'; console.log(getVideoMetadata)"`,
	);

	execSync(
		`node --input-type=module -e "import {measureText} from '@remotion/layout-utils'; console.log(measureText)"`,
	);
	execSync(
		`node --input-type=module -e "import {getRenderProgress} from '@remotion/lambda/client'; console.log(getRenderProgress)"`,
	);
	execSync(
		`node --input-type=module -e "import {cancelRenderOnLambda} from '@remotion/lambda/client'; console.log(cancelRenderOnLambda)"`,
	);
	execSync(
		`node --input-type=module -e "import {getRenderProgress} from '@remotion/lambda'; console.log(getRenderProgress)"`,
	);
	execSync(
		`node --input-type=module -e "import {loadFont} from '@remotion/google-fonts/Montserrat'; console.log(loadFont)"`,
	);

	expect(() =>
		execSync(
			`node --input-type=module -e "import {Misspell} from '@remotion/shapes'; console.log(Rect)"`,
			{
				stdio: 'ignore',
			},
		),
	).toThrow();
});

test('Google font ESM entries share loaded font faces with from-info', () => {
	execSync(`node --input-type=module -e "
		import assert from 'node:assert/strict';
		import {getAvailableFonts} from '@remotion/google-fonts';
		import {getInfo, loadFont, loadVariableFont} from '@remotion/google-fonts/Montserrat';
		import {loadFontFromInfo, loadVariableFontFromInfo} from '@remotion/google-fonts/from-info';

		const added = new Set();
		const document = {fonts: {add: (face) => added.add(face)}};
		let constructed = 0;
		globalThis.FontFace = class {
			constructor() { constructed++; }
			load() { return Promise.resolve(this); }
		};
		globalThis.fetch = async () => ({
			ok: true,
			arrayBuffer: async () => new ArrayBuffer(1),
		});

		const options = {document, weights: ['400'], subsets: ['latin']};
		const info = getInfo();
		assert.equal(info.fontFamily, 'Montserrat');
		await Promise.all([
			loadFont('normal', options).waitUntilDone(),
			loadFontFromInfo(info, 'normal', options).waitUntilDone(),
		]);
		assert.equal(constructed, 1);
		assert.equal(added.size, 1);

		const fromPicker = await getAvailableFonts().find((font) => font.importName === 'Montserrat').load();
		await fromPicker.loadFont('normal', options).waitUntilDone();
		assert.equal(constructed, 1);

		await Promise.all([
			loadVariableFont('normal', options).waitUntilDone(),
			loadVariableFontFromInfo(info, 'normal', options).waitUntilDone(),
		]);
		assert.equal(constructed, 2);
		assert.equal(added.size, 2);

		const iframeFaces = new Set();
		const iframeDocument = {fonts: {add: (face) => iframeFaces.add(face)}};
		const iframeOptions = {...options, document: iframeDocument};
		await Promise.all([
			loadFont('normal', iframeOptions).waitUntilDone(),
			loadFontFromInfo(info, 'normal', iframeOptions).waitUntilDone(),
			loadVariableFont('normal', iframeOptions).waitUntilDone(),
			loadVariableFontFromInfo(info, 'normal', iframeOptions).waitUntilDone(),
		]);
		assert.equal(constructed, 4);
		assert.equal(iframeFaces.size, 2);
		await loadFontFromInfo(info, 'normal', options).waitUntilDone();
		assert.equal(constructed, 4);
		assert.equal(added.size, 2);
	"`);
});
