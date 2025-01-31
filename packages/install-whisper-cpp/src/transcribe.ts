import {spawn} from 'node:child_process';
import fs, {existsSync} from 'node:fs';
import path from 'node:path';
import type {WhisperModel} from './download-whisper-model';
import {getModelPath} from './download-whisper-model';
import {getWhisperExecutablePath} from './install-whisper-cpp';
import type {Language} from './languages';

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

export type TranscribeOnProgress = (progress: number) => void;

// https://github.com/ggerganov/whisper.cpp/blob/fe36c909715e6751277ddb020e7892c7670b61d4/examples/main/main.cpp#L989-L999
// https://github.com/remotion-dev/remotion/issues/4168
export const modelToDtw = (model: WhisperModel): string => {
	if (model === 'large-v3-turbo') {
		return 'large.v3.turbo';
	}

	if (model === 'large-v3') {
		return 'large.v3';
	}

	if (model === 'large-v2') {
		return 'large.v2';
	}

	if (model === 'large-v1') {
		return 'large.v1';
	}

	return model;
};

const transcribeToTemporaryFile = async ({
	fileToTranscribe,
	whisperPath,
	model,
	tmpJSONPath,
	modelFolder,
	translate,
	tokenLevelTimestamps,
	printOutput,
	tokensPerItem,
	language,
	splitOnWord,
	signal,
	onProgress,
}: {
	fileToTranscribe: string;
	whisperPath: string;
	model: WhisperModel;
	tmpJSONPath: string;
	modelFolder: string | null;
	translate: boolean;
	tokenLevelTimestamps: boolean;
	printOutput: boolean;
	tokensPerItem: number | null;
	language: Language | null;
	splitOnWord: boolean | null;
	signal: AbortSignal | null;
	onProgress: TranscribeOnProgress | null;
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
		tokensPerItem ? ['--max-len', tokensPerItem] : null,
		'-ojf', // Output full JSON
		tokenLevelTimestamps ? ['--dtw', modelToDtw(model)] : null,
		model ? [`-m`, `${modelPath}`] : null,
		['-pp'], // print progress
		translate ? '-tr' : null,
		language ? ['-l', language.toLowerCase()] : null,
		splitOnWord ? ['--split-on-word', splitOnWord] : null,
	]
		.flat(1)
		.filter(Boolean) as string[];

	const outputPath = await new Promise<string>((resolve, reject) => {
		const task = spawn(executable, args, {
			cwd: path.resolve(process.cwd(), whisperPath),
			signal: signal ?? undefined,
		});
		const predictedPath = `${tmpJSONPath}.json`;

		let output: string = '';

		const onData = (data: Buffer) => {
			const str = data.toString('utf-8');
			const hasProgress = str.includes('progress =');
			if (hasProgress) {
				const progress = parseFloat(str.split('progress =')[1].trim());
				onProgress?.(progress / 100);
			}

			output += str;

			// Sometimes it hangs here
			if (str.includes('ggml_metal_free: deallocating')) {
				task.kill();
			}
		};

		let stderr = '';

		const onStderr = (data: Buffer) => {
			onData(data);
			const utf8 = data.toString('utf-8');
			stderr += utf8;
			if (printOutput) {
				process.stderr.write(utf8);
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

		task.on('exit', (code, exitSignal) => {
			// Whisper sometimes files also with error code 0
			// https://github.com/ggerganov/whisper.cpp/pull/1952/files

			if (existsSync(predictedPath)) {
				resolve(predictedPath);
				onProgress?.(1);
				return;
			}

			if (exitSignal) {
				reject(
					new Error(`Process was killed with signal ${exitSignal}: ${output}`),
				);
				return;
			}

			if (stderr.includes('must be 16 kHz')) {
				reject(
					new Error(
						'wav file must be 16 kHz - use this command to make it so: "ffmpeg -i input.wav -ar 16000 output.wav -y"',
					),
				);
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
	tokensPerItem,
	language,
	splitOnWord,
	signal,
	onProgress,
}: {
	inputPath: string;
	whisperPath: string;
	model: WhisperModel;
	tokenLevelTimestamps: HasTokenLevelTimestamps;
	modelFolder?: string;
	translateToEnglish?: boolean;
	printOutput?: boolean;
	tokensPerItem?: true extends HasTokenLevelTimestamps ? never : number | null;
	language?: Language | null;
	splitOnWord?: boolean;
	signal?: AbortSignal;
	onProgress?: TranscribeOnProgress;
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
			'Invalid inputFile type. The provided file is not a wav file! Convert the file to a 16KHz wav file first: "ffmpeg -i input.mp4 -ar 16000 output.wav -y"',
		);
	}

	const tmpJSONDir = path.join(process.cwd(), 'tmp');

	const {outputPath: tmpJSONPath} = await transcribeToTemporaryFile({
		fileToTranscribe: inputPath,
		whisperPath,
		model,
		tmpJSONPath: tmpJSONDir,
		modelFolder: modelFolder ?? null,
		translate: translateToEnglish,
		tokenLevelTimestamps,
		printOutput,
		tokensPerItem: tokenLevelTimestamps ? 1 : (tokensPerItem ?? 1),
		language: language ?? null,
		signal: signal ?? null,
		splitOnWord: splitOnWord ?? null,
		onProgress: onProgress ?? null,
	});

	const json = (await readJson(
		tmpJSONPath,
	)) as TranscriptionJson<HasTokenLevelTimestamps>;
	fs.unlinkSync(tmpJSONPath);

	return json;
};
