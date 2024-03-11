import {exec} from 'node:child_process';
import {existsSync} from 'node:fs';
import os from 'node:os';

export const transcribe = async (
	whisperPath: string,
	modelPath: string,
	inputPath: string,
	outputPath: string,
) => {
	const executable = os.platform() === 'win32' ? 'main.exe' : './main';

	// check if whisper exists, throw error with good error message if not
	if (!existsSync(whisperPath)) {
		console.log(`Whisper does not exists at ${whisperPath}`);
	}

	// check if file exists
	if (!existsSync(inputPath)) {
		console.log(`Inputfile does not exist at ${inputPath}`);
	}

	// should we allow any path or just accept the model name as prop?
	// const modelPath = path.join(whisperPath, `ggml-${whisperModel}.bin`);

	exec(
		`${executable} -f ${inputPath} --output-file ${outputPath} --output-json --max-len 1 -m ${modelPath}`,
		{cwd: whisperPath},
	);
};
