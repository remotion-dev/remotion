import {$} from 'bun';
import fs from 'fs';
import os from 'os';
import path from 'path';

const randomDir = os.tmpdir();

const wasmDir = path.join(randomDir, 'whisper-wasm');

if (fs.existsSync(wasmDir)) {
	fs.rmSync(wasmDir, {recursive: true});
}

fs.mkdirSync(wasmDir, {recursive: true});

const cwd = path.join(wasmDir, 'build-em');

await $`git clone https://github.com/ggerganov/whisper.cpp ${wasmDir}`;
await $`git checkout v1.7.4`.cwd(wasmDir);

fs.mkdirSync(cwd);

const cmakeListsFile = path.join(
	wasmDir,
	'examples',
	'whisper.wasm',
	'CMakeLists.txt',
);

const file = fs.readFileSync(cmakeListsFile, 'utf8');

// Disable Node.JS target
const lines = file.split('\n').map((line) => {
	if (line.includes('-s FORCE_FILESYSTEM=1 \\')) {
		return `-s FORCE_FILESYSTEM=1 -s ENVIRONMENT='web,worker' \\`;
	}

	return line;
});

fs.writeFileSync(
	cmakeListsFile,
	[
		...lines,
		// Generate a .d.ts file
		`set(CMAKE_CXX_FLAGS "$\{CMAKE_CXX_FLAGS\} -lembind --emit-tsd $\{CMAKE_CURRENT_BINARY_DIR\}/interface.d.ts")`,
	].join('\n'),
);

const emscriptenFilePath = path.join(wasmDir, 'examples', 'whisper.wasm', 'emscripten.cpp');
//now get our version
const modifiedVersion = fs.readFileSync('./emscripten.cpp', 'utf8');
fs.writeFileSync(emscriptenFilePath, modifiedVersion);

// brew install emscripten if necessary
await $`emcmake cmake ..`.cwd(cwd);
await $`make -j`.cwd(cwd);

const mainJsFile = path.join(cwd, 'bin', 'whisper.wasm', 'main.js');

let content = fs.readFileSync(mainJsFile, 'utf8');

// Modify the Worker path
content = content.replace(
    'new Worker(pthreadMainJs',
    `new Worker(new URL('./main.mjs', import.meta.url)`
);

// Write the modified content directly to the destination
fs.writeFileSync(path.join(__dirname, 'main.js'), content, 'utf8');


const dTsFile = path.join(
	wasmDir,
	'build-em',
	'examples',
	'whisper.wasm',
	'interface.d.ts',
);

fs.copyFileSync(dTsFile, path.join(__dirname, 'src', 'emscripten-types.d.ts'));

fs.rmSync(wasmDir, {recursive: true});
