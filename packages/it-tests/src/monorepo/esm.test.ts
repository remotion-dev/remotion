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
