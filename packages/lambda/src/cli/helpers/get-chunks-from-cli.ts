import fs from 'node:fs';
import path from 'node:path';
import {BrowserSafeApis} from '@remotion/renderer/client';

// Accepts the same forms as --webhook-custom-data: inline JSON, or a path to a
// JSON file. The shape is checked by validateChunks() in the launch handler,
// which also knows the frame range the chunks have to cover.
export const parseChunksFlag = (
	value: string | number | undefined,
): [number, number][] | null => {
	if (value === undefined) {
		return null;
	}

	const {cliFlag} = BrowserSafeApis.options.chunksOption;
	const raw = String(value);
	const jsonFile = path.resolve(process.cwd(), raw);
	const json = fs.existsSync(jsonFile)
		? fs.readFileSync(jsonFile, 'utf-8')
		: raw;

	try {
		return JSON.parse(json);
	} catch {
		throw new Error(
			`--${cliFlag} needs to be a JSON array of [startFrame, endFrame] pairs, or a path to a JSON file containing one, but got: ${raw}`,
		);
	}
};
