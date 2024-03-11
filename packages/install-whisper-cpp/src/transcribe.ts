import {exec} from 'node:child_process';
import fs, {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import util from 'node:util';

interface TranscribeProps {
	whisperPath: string;
	modelPath: string;
	inputPath: string;
	outputPath: string;
}

const readJson = (tempPath: string) => {
	let jsonData;

	fs.readFile(tempPath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading the file:', err);
			return;
		}

		// Parse the JSON data
		try {
			jsonData = JSON.parse(data);
			console.log('JSON data:', jsonData);

			// Now you can work with the parsed JSON object
			// For example, you can access properties like jsonData.propertyName
		} catch (parseError) {
			console.error('Error parsing JSON:', parseError);
		}
	});
	return jsonData;
};

const translateToTempFile = async (transcribeProps: TranscribeProps) => {
	const {whisperPath, inputPath, outputPath, modelPath} = transcribeProps;
	const promisifiedExec = util.promisify(exec);
	const executable =
		os.platform() === 'win32'
			? path.join(whisperPath, 'main.exe')
			: path.join(whisperPath, './main');

	await promisifiedExec(
		`${executable} -f ${inputPath} --output-file ${outputPath} --output-json --max-len 1 -m ${modelPath}`,
		{cwd: whisperPath},
	);
};

export const transcribe = async (transcribeProps: TranscribeProps) => {
	// Check if whisper exists, throw an error with a good error message if not
	const {whisperPath, inputPath} = transcribeProps;
	if (!existsSync(whisperPath)) {
		throw new Error(`Whisper does not exist at ${whisperPath}`);
	}

	// Check if the file exists
	if (!existsSync(inputPath)) {
		throw new Error(`Input file does not exist at ${inputPath}`);
	}

	const res = await translateToTempFile(transcribeProps);

	console.log('Res: ', res);

	const json = readJson(
		'/Users/patricsalvisberg/Documents/Develop/template-tiktok/translated.json',
	);

	return json;
};
