import path from 'path';
import {getCompositions, RenderInternals} from '@remotion/renderer';
import {loadConfig} from './get-config-file-name';
import {parsedCli} from './parse-command-line';
import {Log} from './log';
import {bundleOnCli} from './setup-cache';

export const listCompositionsCommand = async () => {
	const file = parsedCli._[1];

	if (!file) {
		Log.error(
			'The compositions command requires you to specify a root file. For example'
		);
		Log.error('  npx remotion compositions src/index.tsx');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	const fullPath = path.join(process.cwd(), file);

	loadConfig();

	const bundled = await bundleOnCli(fullPath, 1);

	const compositions = await getCompositions(bundled);
	Log.info();
	Log.info('The following compositions are available:');
	Log.info();

	const firstColumnLength =
		RenderInternals.max(compositions.map(({id}) => id.length)) + 4;
	const secondColumnLength = 8;
	const thirdColumnLength = 15;

	Log.info(
		`${'Composition'.padEnd(firstColumnLength, ' ')}${'FPS'.padEnd(
			secondColumnLength
		)}${'Dimensions'.padEnd(thirdColumnLength, ' ')}Duration`
	);
	Log.info(
		compositions
			.map((comp) => {
				const isStill = comp.durationInFrames === 1;
				const dimensions = `${comp.width}x${comp.height}`;
				const fps = isStill ? '' : comp.fps.toString();
				const durationInSeconds = (comp.durationInFrames / comp.fps).toFixed(2);
				const formattedDuration = isStill
					? 'Still'
					: `${comp.durationInFrames} (${durationInSeconds} sec)`;
				return [
					comp.id.padEnd(firstColumnLength, ' '),
					fps.padEnd(secondColumnLength, ' '),
					dimensions.padEnd(thirdColumnLength, ' '),
					formattedDuration,
				].join('');
			})
			.join('\n')
	);
};
