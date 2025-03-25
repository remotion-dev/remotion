const fs = require('fs');
const path = require('path');

const HELPERS_TS = path.join(__dirname, 'src/helpers.ts');
const MAIN_JS = path.join(__dirname, 'main.js');
const INDEX_MODULE_TS = path.join(__dirname, 'src/index.module.ts');

// Ensure both files exist
if (!fs.existsSync(HELPERS_TS)) {
	console.error('Error: helpers.ts not found!');
	process.exit(1);
}

if (!fs.existsSync(MAIN_JS)) {
	console.error('Error: main.ts not found!');
	process.exit(1);
}

// Empty index.module.ts before writing
fs.writeFileSync(INDEX_MODULE_TS, '', 'utf8');

// Read file contents
const helpersContent = fs.readFileSync(HELPERS_TS, 'utf8');
const mainJsContent = fs.readFileSync(MAIN_JS, 'utf8');

// Concatenate helpers.ts and main.js, then write to index.ts
fs.writeFileSync(
	INDEX_MODULE_TS,
	helpersContent + '\n' + mainJsContent,
	'utf8',
);

console.log(
	'✅ Emptied index.module.ts and concatenated helpers.ts and main.ts into it.',
);
