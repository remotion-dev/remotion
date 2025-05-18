import {$} from 'bun';
import fs from 'fs';
import os from 'os';
import path from 'path';

const randomDir = os.tmpdir();

const wasmDir = path.join(randomDir, 'whisper-web');

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

// Disable Node.JS target, compile with assertions to get stack trace
const lines = file.split('\n').map((line) => {
	if (line.includes('-s FORCE_FILESYSTEM=1 \\')) {
		return `-s FORCE_FILESYSTEM=1 -s ENVIRONMENT='web,worker' -s ASSERTIONS=1 \\`;
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

const emscriptenFilePath = path.join(
	wasmDir,
	'examples',
	'whisper.wasm',
	'emscripten.cpp',
);
//now get our version
const modifiedVersion = fs.readFileSync('./emscripten.cpp', 'utf8');
fs.writeFileSync(emscriptenFilePath, modifiedVersion);

// brew install emscripten if necessary
await $`emcmake cmake ..`.cwd(cwd);
await $`make -j`.cwd(cwd);

const mainJsFile = path.join(cwd, 'bin', 'whisper.wasm', 'main.js');

let content = fs.readFileSync(mainJsFile, 'utf8');

// pass our handlers
content = content.replace(
	'var moduleOverrides=Object.assign({},Module);',
	'var moduleOverrides=Object.assign({},Module);if (typeof window !== "undefined") {Object.assign(Module, window.remotion_wasm_moduleOverrides);};',
);

// assert changes have been made
if (!content.includes('window.remotion_wasm_moduleOverrides')) {
	throw new Error('Changes have not been made');
}

// Modify the Worker path
const mainContent =
	content.replace(
		'new Worker(pthreadMainJs',
		`new Worker(new URL('./worker.js', import.meta.url)`,
	) +
	'\n' +
	'export default Module;' +
	'\n';

// assert changes have been made
if (!mainContent.includes('new Worker(new URL(')) {
	throw new Error('Changes have not been made');
}

const workerContent =
	content.replace(
		'worker=new Worker(pthreadMainJs,workerOptions)',
		`throw new Error('Already is in worker')`,
	) +
	'\n' +
	'export default Module;' +
	'\n';

if (!workerContent.includes('Already is in worker')) {
	throw new Error('Changes have not been made');
}

// Write the modified content directly to the destination
fs.writeFileSync(path.join(__dirname, 'main.js'), mainContent, 'utf8');
fs.writeFileSync(path.join(__dirname, 'worker.js'), workerContent, 'utf8');

const dTsFile = path.join(
	wasmDir,
	'build-em',
	'examples',
	'whisper.wasm',
	'interface.d.ts',
);

fs.copyFileSync(dTsFile, path.join(__dirname, 'main.d.ts'));

fs.rmSync(wasmDir, {recursive: true});
