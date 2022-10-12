import {getCompositions, RenderInternals} from '@remotion/renderer';
import path from 'path';
import {getCliOptions} from './get-cli-options';
import {loadConfig} from './get-config-file-name';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';

const max = (arr: number[]) => {
	if (arr.length === 0) {
		throw new Error('Array of 0 length');
	}

	let biggest = arr[0];
	for (let i = 0; i < arr.length; i++) {
		const elem = arr[i];
		if (elem > biggest) {
			biggest = elem;
		}
	}

	return biggest;
};

export const listCompositionsCommand = async (remotionRoot: string) => {
	const file = parsedCli._[1];

	if (!file) {
		Log.error(
			'The `compositions` command requires you to specify a entry point. For example'
		);
		Log.error('  npx remotion compositions src/index.tsx');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	const downloadMap = RenderInternals.makeDownloadMap();

	const fullPath = path.join(process.cwd(), file);

	await loadConfig(remotionRoot);

	const {
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		puppeteerTimeout,
		port,
		publicDir,
	} = await getCliOptions({
		isLambda: false,
		type: 'get-compositions',
		codec: 'h264',
		remotionRoot,
	});

	const {urlOrBundle: bundled, cleanup: cleanupBundle} =
		await bundleOnCliOrTakeServeUrl({
			remotionRoot,
			fullPath,
			steps: ['bundling'],
			publicDir,
		});

	const compositions = await getCompositions(bundled, remotionRoot, {
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		timeoutInMilliseconds: puppeteerTimeout,
		port,
		downloadMap,
	});
	if (!quietFlagProvided()) {
		Log.info();
		Log.info('The following compositions are available:');
		Log.info();
	}

	const firstColumnLength = max(compositions.map(({id}) => id.length)) + 4;
	const secondColumnLength = 8;
	const thirdColumnLength = 15;

	if (quietFlagProvided()) {
		Log.info(compositions.map((c) => c.id).join(' '));
		return;
	}

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

	await RenderInternals.cleanDownloadMap(downloadMap);
	await cleanupBundle();
	Log.verbose('Cleaned up', downloadMap.assetDir);
};
