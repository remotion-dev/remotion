import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
} from '@remotion/studio-shared';
import {updateSequenceProps} from '../../codemods/update-sequence-props';
import {makeHyperlink} from '../../hyperlinks/make-link';
import type {ApiHandler} from '../api-types';
import {suppressHmrForFile} from '../hmr-suppression';

let warnedAboutPrettier = false;

export const saveSequencePropsHandler: ApiHandler<
	SaveSequencePropsRequest,
	SaveSequencePropsResponse
> = async ({
	input: {fileName, line, column, key, value, enumPaths, defaultValue},
	remotionRoot,
	logLevel,
}) => {
	try {
		const absolutePath = path.resolve(remotionRoot, fileName);
		const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
		if (fileRelativeToRoot.startsWith('..')) {
			throw new Error('Cannot modify a file outside the project');
		}

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const {output, oldValueString, formatted} = await updateSequenceProps({
			input: fileContents,
			targetLine: line,
			key,
			value: JSON.parse(value),
			enumPaths,
			defaultValue: defaultValue !== null ? JSON.parse(defaultValue) : null,
		});

		suppressHmrForFile(absolutePath);
		writeFileSync(absolutePath, output);

		const newValueString = JSON.stringify(JSON.parse(value));
		const locationLabel = `${fileRelativeToRoot}:${line}:${column}`;
		const fileLink = makeHyperlink({
			url: `file://${absolutePath}`,
			text: locationLabel,
			fallback: locationLabel,
		});
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.blueBright(
				`${fileLink} updated: ${key} ${oldValueString} \u2192 ${newValueString}`,
			),
		);
		if (!formatted && !warnedAboutPrettier) {
			warnedAboutPrettier = true;
			RenderInternals.Log.warn(
				{indent: false, logLevel},
				RenderInternals.chalk.yellow(
					'Could not format the file using Prettier. Install "prettier" and add a config file to enable automatic formatting.',
				),
			);
		}

		return {
			success: true,
		};
	} catch (err) {
		return {
			success: false,
			reason: (err as Error).message,
		};
	}
};
