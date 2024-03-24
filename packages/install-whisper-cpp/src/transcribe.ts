import {spawn} from 'node:child_process';
import fs, {existsSync} from 'node:fs';
import path from 'node:path';
import type {WhisperModel} from './download-whisper-model';
import {getModelPath} from './download-whisper-model';
import {getWhisperExecutablePath} from './install-whisper-cpp';

type Timestamps = {
	from: string;
	to: string;
};

type Offsets = {
	from: number;
	to: number;
};

type WordLevelToken = {
	t_dtw: number;
	text: string;
	timestamps: Timestamps;
	offsets: Offsets;
	id: number;
	p: number;
};

type TranscriptionItem = {
	timestamps: Timestamps;
	offsets: Offsets;
	text: string;
};

type TranscriptionItemWithTimestamp = TranscriptionItem & {
	tokens: WordLevelToken[];
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

export type TranscriptionJson<WithTokenLevelTimestamp extends boolean> = {
	systeminfo: string;
	model: Model;
	params: Params;
	result: Result;
	transcription: true extends WithTokenLevelTimestamp
		? TranscriptionItemWithTimestamp[]
		: TranscriptionItem[];
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
	tokenLevelTimestamps,
	printOutput,
}: {
	fileToTranscribe: string;
	whisperPath: string;
	model: WhisperModel;
	tmpJSONPath: string;
	modelFolder: string | null;
	translate: boolean;
	tokenLevelTimestamps: boolean;
	printOutput: boolean;
}): Promise<{
	outputPath: string;
}> => {
	const modelPath = getModelPath(modelFolder ?? whisperPath, model);

	if (!fs.existsSync(modelPath)) {
		throw new Error(
			`Error: Model ${model} does not exist at ${
				modelFolder ? modelFolder : modelPath
			}. Check out the downloadWhisperModel() API at https://www.remotion.dev/docs/install-whisper-cpp/download-whisper-model to see how to install whisper models`,
		);
	}

	const executable = getWhisperExecutablePath(whisperPath);

	const args = [
		'-f',
		fileToTranscribe,
		'--output-file',
		tmpJSONPath,
		'--output-json',
		'--max-len',
		'1',
		'-ojf', // Output full JSON
		tokenLevelTimestamps ? ['--dtw', model] : null,
		model ? [`-m`, `${modelPath}`] : null,
		translate ? '-tr' : null,
	]
		.flat(1)
		.filter(Boolean) as string[];

	const outputPath = await new Promise<string>((resolve, reject) => {
		const task = spawn(executable, args, {
			cwd: whisperPath,
		});
		const predictedPath = `${tmpJSONPath}.json`;

		let output: string = '';

		const onData = (data: Buffer) => {
			const str = data.toString('utf-8');
			output += str;

			// Sometimes it hangs here
			if (str.includes('ggml_metal_free: deallocating')) {
				task.kill();
			}
		};

		const onStderr = (data: Buffer) => {
			onData(data);
			if (printOutput) {
				process.stderr.write(data.toString('utf-8'));
			}
		};

		const onStdout = (data: Buffer) => {
			onData(data);
			if (printOutput) {
				process.stdout.write(data.toString('utf-8'));
			}
		};

		task.stdout.on('data', onStdout);
		task.stderr.on('data', onStderr);

		task.on('exit', (code, signal) => {
			// Whisper sometimes files also with error code 0
			// https://github.com/ggerganov/whisper.cpp/pull/1952/files

			if (existsSync(predictedPath)) {
				resolve(predictedPath);
				return;
			}

			if (signal) {
				reject(
					new Error(`Process was killed with signal ${signal}: ${output}`),
				);
				return;
			}

			reject(
				new Error(
					`No transcription was created (process exited with code ${code}): ${output}`,
				),
			);
		});
	});

	return {outputPath};
};

export const transcribe = async <HasTokenLevelTimestamps extends boolean>({
	inputPath,
	whisperPath,
	model,
	modelFolder,
	translateToEnglish = false,
	tokenLevelTimestamps,
	printOutput = true,
}: {
	inputPath: string;
	whisperPath: string;
	model: WhisperModel;
	tokenLevelTimestamps: HasTokenLevelTimestamps;
	modelFolder?: string;
	translateToEnglish?: boolean;
	printOutput?: boolean;
}): Promise<TranscriptionJson<HasTokenLevelTimestamps>> => {
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

	const {outputPath: tmpJSONPath} = await transcribeToTempJSON({
		fileToTranscribe: inputPath,
		whisperPath,
		model,
		tmpJSONPath: tmpJSONDir,
		modelFolder: modelFolder ?? null,
		translate: translateToEnglish,
		tokenLevelTimestamps,
		printOutput,
	});

	const json = (await readJson(
		tmpJSONPath,
	)) as TranscriptionJson<HasTokenLevelTimestamps>;
	fs.unlinkSync(tmpJSONPath);

	return json;
};
