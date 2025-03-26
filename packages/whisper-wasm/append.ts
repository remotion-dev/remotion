import fs from 'fs';
import path from 'path';

const TRANSCRIBE_PATH = path.join(__dirname, 'src/transcribe.ts');
const DOWNLOAD_WHISPER_MODEL_PATH = path.join(
	__dirname,
	'src/download-whisper-model.ts',
);
const MAIN_JS = path.join(__dirname, 'main.js');
const INDEX_MODULE_TS = path.join(__dirname, 'src/index.module.ts');

// Ensure both files exist
if (!fs.existsSync(TRANSCRIBE_PATH)) {
	console.error('Error: transcribe.ts not found!');
	process.exit(1);
}

if (!fs.existsSync(DOWNLOAD_WHISPER_MODEL_PATH)) {
	console.error('Error: download-whisper-model.ts not found!');
	process.exit(1);
}

if (!fs.existsSync(MAIN_JS)) {
	console.error('Error: main.ts not found!');
	process.exit(1);
}

// Empty index.module.ts before writing
fs.writeFileSync(INDEX_MODULE_TS, '', 'utf8');

// Read file contents
const transcribeContent = fs.readFileSync(TRANSCRIBE_PATH, 'utf8');
const downloadWhisperModelContent = fs.readFileSync(
	DOWNLOAD_WHISPER_MODEL_PATH,
	'utf8',
);
const mainJsContent = fs.readFileSync(MAIN_JS, 'utf8');

// Concatenate helpers.ts and main.js, then write to index.ts
fs.writeFileSync(
	INDEX_MODULE_TS,
	transcribeContent +
		'\n' +
		downloadWhisperModelContent +
		'\n' +
		`/* eslint-disable */
` +
		'\n' +
		mainJsContent +
		'\n',
	'utf8',
);

console.log(
	'✅ Emptied index.module.ts and concatenated helpers.ts and main.ts into it.',
);
