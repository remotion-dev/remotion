import {exec} from 'node:child_process';
import fs, {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import util from 'node:util';
import type {WhisperModel} from './download-whisper-model';
import {getModelPath} from './download-whisper-model';

type Timestamps = {
	from: string;
	to: string;
};

type Offsets = {
	from: number;
	to: number;
};

type TranscriptionItem = {
	timestamps: Timestamps;
	offsets: Offsets;
	text: string;
};

type Model = {
	type: string;
	multilingual: boolean;
	vocab: number;
	audio: {
		ctx: number;
		state: number;
		head: number;
		layer: number;
	};
	text: {
		ctx: number;
		state: number;
		head: number;
		layer: number;
	};
	mels: number;
	ftype: number;
};

type Params = {
	model: string;
	language: string;
	translate: boolean;
};

type Result = {
	language: string;
};

export type TranscriptionJson = {
	systeminfo: string;
	model: Model;
	params: Params;
	result: Result;
	transcription: TranscriptionItem[];
};

const isWavFile = (inputPath: string) => {
	const splitted = inputPath.split('.');
	if (!splitted) {
		return false;
	}

	return splitted[splitted.length - 1] === 'wav';
};

const readJson = async (jsonPath: string) => {
	const data = await fs.promises.readFile(jsonPath, 'utf8');
	return JSON.parse(data);
};

const transcribeToTempJSON = async ({
	fileToTranscribe,
	whisperPath,
	model,
	tmpJSONPath,
	modelFolder,
	translate,
}: {
	fileToTranscribe: string;
	whisperPath: string;
	model: WhisperModel;
	tmpJSONPath: string;
	modelFolder: string | null;
	translate: boolean;
}) => {
	const promisifiedExec = util.promisify(exec);

	const modelPath = getModelPath(modelFolder ?? whisperPath, model);

	if (!fs.existsSync(modelPath)) {
		throw new Error(
			`Error: Model ${model} does not exist at ${
				modelFolder ? modelFolder : modelPath
			}. Check out the downloadWhisperModel() API at https://www.remotion.dev/docs/install-whisper-cpp/download-whisper-model to see how to install whisper models`,
		);
	}

	const executable =
		os.platform() === 'win32'
			? path.join(whisperPath, 'main.exe')
			: path.join(whisperPath, './main');

	const modelOption = model ? `-m ${modelPath}` : '';
	const translateOption = translate ? `-tr ` : '';

	await promisifiedExec(
		`${executable} -f ${fileToTranscribe} --output-file ${tmpJSONPath} --output-json --max-len 1 ${modelOption} ${translateOption}`,
		{cwd: whisperPath},
	).then(({stderr}) => {
		if (stderr.includes('error')) {
			throw new Error('An error occured while transcribing: ' + stderr);
		}
	});
};

export const transcribe = async ({
	inputPath,
	whisperPath,
	model,
	modelFolder,
	translateToEnglish = false,
}: {
	inputPath: string;
	whisperPath: string;
	model: WhisperModel;
	modelFolder?: string;
	translateToEnglish?: boolean;
}): Promise<TranscriptionJson> => {
	if (!existsSync(whisperPath)) {
		throw new Error(
			`Whisper does not exist at ${whisperPath}. Double-check the passed whisperPath. If you havent installed whisper, check out the installWhisperCpp() API at https://www.remotion.dev/docs/install-whisper-cpp/install-whisper-cpp to see how to install whisper programatically.`,
		);
	}

	if (!existsSync(inputPath)) {
		throw new Error(`Input file does not exist at ${inputPath}`);
	}

	if (!isWavFile(inputPath)) {
		throw new Error(
			'Invalid inputFile type. The provided file is not a wav file!',
		);
	}

	const tmpJSONDir = path.join(process.cwd(), 'tmp');

	await transcribeToTempJSON({
		fileToTranscribe: inputPath,
		whisperPath,
		model,
		tmpJSONPath: tmpJSONDir,
		modelFolder: modelFolder ?? null,
		translate: translateToEnglish,
	});

	const tmpJSONPath = `${tmpJSONDir}.json`;

	const json = (await readJson(tmpJSONPath)) as TranscriptionJson;
	fs.unlinkSync(tmpJSONPath);

	return json;
};
