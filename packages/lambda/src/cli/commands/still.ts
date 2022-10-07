import {CliInternals, ConfigInternals} from '@remotion/cli';
import type {ImageFormat, StillImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {downloadMedia} from '../../api/download-media';
import {renderStillOnLambda} from '../../api/render-still-on-lambda';
import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
} from '../../shared/constants';
import {validatePrivacy} from '../../shared/validate-privacy';
import {validateMaxRetries} from '../../shared/validate-retries';
import {parsedLambdaCli} from '../args';
import {getAwsRegion} from '../get-aws-region';
import {findFunctionName} from '../helpers/find-function-name';
import {quit} from '../helpers/quit';
import {Log} from '../log';

export const STILL_COMMAND = 'still';

const deriveExtensionFromFilename = (
	filename: string | null
): StillImageFormat | null => {
	if (filename?.endsWith('.png')) {
		return 'png';
	}

	if (filename?.endsWith('.jpg')) {
		return 'jpeg';
	}

	if (filename?.endsWith('.jpeg')) {
		return 'jpeg';
	}

	return null;
};

const getImageFormat = ({
	downloadName,
	outName,
	configImageFormat,
	cliFlag,
}: {
	downloadName: string | null;
	outName: string | null;
	configImageFormat: ImageFormat | null;
	cliFlag: ImageFormat | null;
}): {format: StillImageFormat; source: string} => {
	const outNameExtension = deriveExtensionFromFilename(outName);
	const downloadNameExtension = deriveExtensionFromFilename(downloadName);

	if (
		outNameExtension &&
		downloadNameExtension &&
		outNameExtension !== downloadNameExtension
	) {
		throw new TypeError(
			`Image format mismatch: ${outName} was given as the S3 output name and ${downloadName} was given as the download name, but the extensions don't match.`
		);
	}

	if (downloadNameExtension) {
		if (cliFlag && downloadNameExtension !== cliFlag) {
			throw new TypeError(
				`Image format mismatch: ${downloadName} was given as the download name, but --image-format=${cliFlag} was passed. The image formats must match.`
			);
		}

		return {format: downloadNameExtension, source: 'Download name extension'};
	}

	if (outNameExtension) {
		if (cliFlag && outNameExtension !== cliFlag) {
			throw new TypeError(
				`Image format mismatch: ${outName} was given as the S3 out name, but --image-format=${cliFlag} was passed. The image formats must match.`
			);
		}

		return {format: outNameExtension, source: 'Out name extension'};
	}

	if (cliFlag === 'none') {
		throw new TypeError(
			'The --image-format flag must not be "none" for stills.'
		);
	}

	if (cliFlag !== null) {
		return {format: cliFlag, source: '--image-format flag'};
	}

	if (configImageFormat !== null && configImageFormat !== 'none') {
		return {format: configImageFormat, source: 'Config file'};
	}

	return {format: 'png', source: 'Default'};
};

export const stillCommand = async (args: string[]) => {
	const serveUrl = args[0];

	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id>  [output-location]`
		);
		quit(1);
	}

	const composition = args[1];
	if (!composition) {
		Log.error('No composition ID passed.');
		Log.info('Pass an additional argument specifying the composition ID.');
		Log.info();
		Log.info(
			`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	const downloadName = args[2] ?? null;
	const outName = parsedLambdaCli['out-name'];

	const {
		chromiumOptions,
		envVariables,
		inputProps,
		logLevel,
		puppeteerTimeout,
		quality,
		stillFrame,
		scale,
	} = await CliInternals.getCliOptions({
		type: 'still',
		isLambda: true,
	});

	const functionName = await findFunctionName();

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy);

	const {format: imageFormat, source: imageFormatReason} = getImageFormat({
		downloadName,
		outName: outName ?? null,
		configImageFormat: ConfigInternals.getUserPreferredImageFormat() ?? null,
		cliFlag: CliInternals.parsedCli['image-format'] ?? null,
	});

	try {
		Log.info(
			CliInternals.chalk.gray(
				`functionName = ${functionName}, imageFormat = ${imageFormat} (${imageFormatReason})`
			)
		);

		const res = await renderStillOnLambda({
			functionName,
			serveUrl,
			inputProps,
			imageFormat,
			composition,
			privacy,
			region: getAwsRegion(),
			maxRetries,
			envVariables,
			frame: stillFrame,
			quality,
			logLevel,
			outName,
			chromiumOptions,
			timeoutInMilliseconds: puppeteerTimeout,
			scale,
		});
		Log.info(
			CliInternals.chalk.gray(
				`Bucket = ${res.bucketName}, renderId = ${res.renderId}`
			)
		);
		Log.verbose(`CloudWatch logs (if enabled): ${res.cloudWatchLogs}`);

		if (downloadName) {
			Log.info('Finished rendering. Downloading...');
			const {outputPath, sizeInBytes} = await downloadMedia({
				bucketName: res.bucketName,
				outPath: downloadName,
				region: getAwsRegion(),
				renderId: res.renderId,
			});
			Log.info('Done!', outputPath, CliInternals.formatBytes(sizeInBytes));
		} else {
			Log.info(`Finished still!`);
			Log.info();
			Log.info(res.url);
		}
	} catch (err) {
		const frames = RenderInternals.parseStack(
			((err as Error).stack ?? '').split('\n')
		);

		const errorWithStackFrame = new RenderInternals.SymbolicateableError({
			message: (err as Error).message,
			frame: null,
			name: (err as Error).name,
			stack: (err as Error).stack,
			stackFrame: frames,
		});
		await CliInternals.handleCommonError(errorWithStackFrame);
		quit(1);
	}
};
